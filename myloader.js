const parser = require("./parser.js");

module.exports = function (source, map) {
  let tree = parser.parseHTML(source);
  console.log("my loader is running=====================", this.resourcePath);

  let template = null;
  let script = null;

  for (let node of tree.children) {
    if (node.tagName == "template")  {
      template = node.children.filter(e => e.type != "text");
    }
    if (node.tagName == "script") {
      script = node.children[0].content;
    }
  }

  let visit = (node) => {
    let attrs = {};
    if (node.type === "text") {
      return JSON.stringify(node.content);
    }
    console.log('node.attributes', node);
    for (let attribute of node.attributes) {
      attrs[attribute.name] = attribute.value;
    }
    let children = node.children.map(node => visit(node));
    return `create("${node.tagName}", ${JSON.stringify(attrs)}, ${children})`
  } 

  visit(template);

  let r = `
import {createElement, Text, Wrapper} from "./createElement";
class Calrousel {
  render() {
    return ${visit(template)};
  }
  mountTo(parent) {
    this.render().mountTo(parent);
  }
  setAttribute(name, value) { //attribute
    this[name] = value;
  }
}
  `;
  return r;
}