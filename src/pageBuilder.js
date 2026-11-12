/**
 * Makes a copy of a <template> from the HTML and fills it in with data.
 *
 * Attributes used in the templates:
 *  - data-slot="name": the element's text becomes data[name]. If data[name]
 *    is a list, one copy of the data-item-template is added per item instead
 *    (used for lists of buttons, table rows, select options, ...). An item can
 *    use a different template by giving its own `template` id.
 *  - data-attr-<attribute>="name": sets <attribute> to data[name], e.g.
 *    data-attr-for="id" sets for="...". true adds an empty attribute (for
 *    attributes like selected), and false/null/undefined leaves it off.
 *  - data-click / data-change / data-input="name": data[name] is run when
 *    that event happens on the element.
 */
export function fillTemplate(templateId, data = {}) {
  const fragment = document.getElementById(templateId).content.cloneNode(true);
  // Collect the elements first, so items added from item templates are not filled again.
  for (const element of [...fragment.querySelectorAll('*')])
    bindElement(element, data);
  return fragment;
}

const EVENTS = { click: 'click', change: 'change', input: 'input' };

function bindElement(element, data) {
  for (const [key, name] of Object.entries(element.dataset)) {
    const value = data[name];

    if (key === 'slot') {
      if (Array.isArray(value))
        element.replaceChildren(...value.map((item) => fillTemplate(item.template ?? element.dataset.itemTemplate, item)));
      else if (value !== undefined && value !== null)
        element.textContent = value;
    }
    else if (key.startsWith('attr') && key.length > 4) {
      // dataset turns data-attr-aria-invalid into attrAriaInvalid; turn it back into aria-invalid.
      const attribute = key.slice(4).replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase()).slice(1);
      if (value === true)
        element.setAttribute(attribute, '');
      else if (value !== false && value !== null && value !== undefined)
        element.setAttribute(attribute, String(value));
    }
    else if (EVENTS[key] && typeof value === 'function') {
      element.addEventListener(EVENTS[key], value);
    }
  }
}

/**
 * Shows a message in the #announcer element. Screen readers read it out
 * because it is a live region
 */
export function announce(message) {
  const region = document.getElementById('announcer');
  // Screen readers only read the message if the text changed, so a
  // non-breaking space is added on every other message. This lets the same
  // message (e.g. pressing the lighter repeatedly) be read again.
  const suffix = region.textContent.endsWith(' ') ? '' : ' ';
  region.textContent = message + suffix;
}

// Controls that keep keyboard focus in the same spot when a view is redrawn.
const FOCUSABLE = 'button, select, input, summary';

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
   * @param {Object} options
   * @param {String} options.section nav button marked as current while this view is open (defaults to id)
   */
  addView(id, templateId, getData = () => ({}), { section = id } = {}) {
    this.views[id] = { templateId, getData, section };
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
   * Focus goes back to the control in the same spot so keyboard and screen
   * reader users don't lose their place.
   */
  refresh() {
    const index = [...this.root.querySelectorAll(FOCUSABLE)].indexOf(document.activeElement);
    this.renderView(this.currentView);
    const controls = this.root.querySelectorAll(FOCUSABLE);
    (index >= 0 && controls.length > 0 ? controls[Math.min(index, controls.length - 1)] : this.heading()).focus();
  }

  /**
   * Draws a view into the root, updates the tab title from its heading, and
   * marks the matching nav button with aria-current.
   */
  renderView(id) {
    const view = this.views[id];
    this.currentView = id;
    this.root.replaceChildren(fillTemplate(view.templateId, view.getData()));
    const heading = this.heading();
    // Headings can't normally receive focus; -1 allows focus() without adding it to the tab order.
    heading.tabIndex = -1;
    document.title = this.siteTitle ? `${heading.textContent} - ${this.siteTitle}` : heading.textContent;

    for (const button of document.querySelectorAll('nav [data-view]')) {
      if (button.dataset.view === view.section)
        button.setAttribute('aria-current', 'page');
      else
        button.removeAttribute('aria-current');
    }
  }

  /** Each view's template should start with an h2. */
  heading() {
    return this.root.querySelector('h2');
  }
}
