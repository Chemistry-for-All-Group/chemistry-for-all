/**
 * Makes a copy of a <template> from the HTML and fills it in with data.
 *
 * Attributes used in the templates:
 *  - data-slot="name": the element's text becomes data[name]. If data[name]
 *    is a list, one copy of the data-item-template is added per item instead
 *    (used for lists of buttons).
 *  - data-click="name": data[name] is run when the element is clicked.
 */
export function fillTemplate(templateId, data = {}) {
  const fragment = document.getElementById(templateId).content.cloneNode(true);

  for (const element of fragment.querySelectorAll('[data-slot]')) {
    const value = data[element.dataset.slot];
    if (Array.isArray(value))
      element.replaceChildren(...value.map((item) => fillTemplate(element.dataset.itemTemplate, item)));
    else if (value !== undefined)
      element.textContent = value;
  }

  for (const element of fragment.querySelectorAll('[data-click]')) {
    const handler = data[element.dataset.click];
    if (handler)
      element.addEventListener('click', handler);
  }

  return fragment;
}

/**
 * Shows a message in the #announcer element. Screen readers read it out
 * because it is a live region (role="status" in the HTML).
 */
export function announce(message) {
  const region = document.getElementById('announcer');
  // Screen readers only read the message if the text changed, so a
  // non-breaking space is added on every other message. This lets the same
  // message (e.g. pressing the lighter repeatedly) be read again.
  const suffix = region.textContent.endsWith(' ') ? '' : ' ';
  region.textContent = message + suffix;
}

/**
 * Handles switching between views of an experiment.
 *
 * A view is a template id plus a function that returns the data to fill it
 * with. Only one view is shown at a time, inside the root element. Clicking
 * any element with data-view="id" (like the nav buttons) opens that view.
 */
export class PageBuilder {
  views = {};
  history = [];
  currentView = null;

  /**
   * @param {String} rootId id of the element views are shown in (usually main)
   * @param {String} siteTitle added to the end of the browser tab title
   */
  constructor(rootId, siteTitle = '') {
    this.root = document.getElementById(rootId);
    this.siteTitle = siteTitle;
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-view]');
      if (target)
        this.show(target.dataset.view);
    });
  }

  /**
   * @param {String} id name used to open the view, e.g. page.show('bench')
   * @param {String} templateId id of the <template> in the HTML
   * @param {Function} getData returns the data for fillTemplate; called each time the view is drawn
   */
  addView(id, templateId, getData = () => ({})) {
    this.views[id] = { templateId, getData };
  }

  /**
   * Opens a view. Focus moves to the view's heading so screen readers
   * announce the new screen.
   *
   * @param {String} id
   * @param {Boolean} moveFocus false when the page first loads
   */
  show(id, moveFocus = true) {
    if (this.currentView && this.currentView !== id)
      this.history.push(this.currentView);
    this.renderView(id);
    if (moveFocus)
      this.heading().focus();
  }

  /** Returns to the previous view, or the first registered view. */
  back() {
    this.renderView(this.history.pop() ?? Object.keys(this.views)[0]);
    this.heading().focus();
  }

  /**
   * Redraws the current view after something in the experiment changed.
   * Focus goes back to the button in the same spot so keyboard and screen
   * reader users don't lose their place.
   */
  refresh() {
    const index = [...this.root.querySelectorAll('button')].indexOf(document.activeElement);
    this.renderView(this.currentView);
    const buttons = this.root.querySelectorAll('button');
    (index >= 0 && buttons.length > 0 ? buttons[Math.min(index, buttons.length - 1)] : this.heading()).focus();
  }

  /** Draws a view into the root and updates the tab title from its heading. */
  renderView(id) {
    const view = this.views[id];
    this.currentView = id;
    this.root.replaceChildren(fillTemplate(view.templateId, view.getData()));
    const heading = this.heading();
    // Headings can't normally receive focus; -1 allows focus() without adding it to the tab order.
    heading.tabIndex = -1;
    document.title = this.siteTitle ? `${heading.textContent} - ${this.siteTitle}` : heading.textContent;
  }

  /** Each view's template should start with an h2. */
  heading() {
    return this.root.querySelector('h2');
  }
}
