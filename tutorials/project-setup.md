This document describes how to set up the project for development and goes over
the commands for running tests and updating the documentation.

## Prerequisites
This project uses [Node.js](https://nodejs.org/en) and 
[npm](https://www.npmjs.com/) to manage dependencies, run tests, and generate
docs locally.

If you do not already have Node.js and npm installed follow these
[instructions](https://nodejs.org/en/download) to install them.

## Setup Instructions
1. Clone the project repository:
```bash
git clone git@github.com:Chemistry-for-All-Group/chemistry-for-all.git
```
2. Navigate to the ``chemistry-for-all`` directory
```bash
cd chemistry-for-all
```
3. Install npm dependencies:
```bash
npm install
```

## Running Tests
To run the project's unit testing suite run the following command in the 
project directory:
```bash
npm test
```

To run a specific test suite run the following command and replace the path 
with the path to the test file:
```bash 
npm test ./Path/To/Tests/Example.test.js
```

## Generating Docs
To update the documentation files run the following command in the project
directory:
```bash
npm run docs
```

## Testing Website Locally
To run the website locally for testing run the following command in the project
directory:
```bash
npm run serve
```