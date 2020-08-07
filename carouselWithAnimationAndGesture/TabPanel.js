import {createElement, Text, Wrapper} from "./lib/createElement";
import {Timeline, Animation} from "./lib/animation";
import {ease} from "./lib/cubicBezier";

export class TabPane {
    constructor(config) {
      this.children = [];
      this.attributes = new Map();
      this.properties = new Map();
      this.timeline = null;
      this.state = Object.create(null);
    }
  
    setAttribute(name, value) { //attribute
      // console.log('name', name);
      // console.log('value', value);
      this[name] = value;
      this.attributes.set(name, value);
    }
  
    appendChild(child) {
      this.children.push(child);
    }

    select(i) {
      this.childViews.forEach(childView => childView.style.display = "none");
      this.childViews[i].style.display = "";


      this.titleViews.forEach(childView => childView.style.display = "none");
      this.titleViews[i].style.display = "";

      // this.titleView.innerText = this.attributes.get('title');
    }
  
    render() {
      setTimeout(() => this.select(0, 16));
      this.childViews = this.children.map(child => <div style="min-height: 300px;width: 300px;">{child}</div>);
      this.titleViews = this.children.map(child => <h1 style="background-color: pink; width: 300px; color: #fff; margin: 0;">{child.getAttribute("title")}</h1>);;

      let root = <div class="panel" style="border:solid 1px pink;width: 300px;">
        {this.titleViews}
        <div>
          {this.childViews}
        </div>
      </div>
  
      return root;
    }
  
    mountTo(parent) {
      this.render().mountTo(parent)
    }
  
  }