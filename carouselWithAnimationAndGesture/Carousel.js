
class Carousel {
    constructor(config) {
      this.children = [];
      this.attributes = new Map();
      this.properties = new Map();
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
  
    render() {
      let children = this.data.map(url => {
        let element = <img src={url} />;
        element.addEventListener("dragstart", event => event.preventDefault())
        return element
      })
  
      let root = <div class={this.attributes.get('class')}>
        {children}
      </div>
  
  
  
      let position = 0;
  
      let nextPic = () => {
        let nextPosition = (position + 1) % this.data.length;
  
        let current = children[position];
        let next = children[nextPosition];
  
        current.style.transition = "ease 0s";
        next.style.transition = "ease 0s";
  
        current.style.transform = `translateX(${- 100 * position}%)`;
        next.style.transform = `translateX(${100 - 100 * nextPosition}%)`;
  
        setTimeout(function () {
          current.style.transition = ""; // means use css rule
          next.style.transition = "";
  
          current.style.transform = `translateX(${-100 - 100 * position}%)`;
          next.style.transform = `translateX(${-100 * nextPosition}%)`;
  
          position = nextPosition;
        }, 16) // 1000 / 60 ≈ 16.7 60 frames
        setTimeout(nextPic, 3000);
      }
  
  
  
      root.addEventListener("mousedown", (event) => {
        let startX = event.clientX, startY = event.clientY;
  
        let lastPosition = (position - 1 + this.data.length) % this.data.length;
        let nextPosition = (position + 1) % this.data.length;
  
  
        let current = children[position];
        let last = children[lastPosition];
        let next = children[nextPosition];
  
        current.style.transition = "ease 0s";
        last.style.transition = "ease 0s";
        next.style.transition = "ease 0s";
  
        current.style.transform = `translateX(${- 500 * position}px)`;
        last.style.transform = `translateX(${- 500 - 500 * lastPosition}px)`;
        next.style.transform = `translateX(${500 - 500 * nextPosition}px)`;
  
        let move = (event) => {
          current.style.transform = `translateX(${event.clientX - startX - 500 * position}px)`;
          last.style.transform = `translateX(${event.clientX - startX - 500 - 500 * lastPosition}px)`;
          next.style.transform = `translateX(${event.clientX - startX + 500 - 500 * nextPosition}px)`;
          // console.log(event.clientX - startX, event.clientY - startY)
        }
        let up = (event) => {
          let offset = 0;
  
          if (event.clientX - startX > 250) {
            offset = 1;
          } else if (event.clientX - startX < -250) {
            offset = -1;
          }
  
          current.style.transition = "";
          last.style.transition = "";
          next.style.transition = "";
  
          current.style.transform = `translateX(${offset * 500 - 500 * position}px)`;
          last.style.transform = `translateX(${offset * 500 - 500 - 500 * lastPosition}px)`;
          next.style.transform = `translateX(${offset * 500 + 500 - 500 * nextPosition}px)`;
  
          position = (position - offset + this.data.length) % this.data.length;
  
          document.removeEventListener("mousemove", move);
          document.removeEventListener("mouseup", up);
        }
  
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
      })
  
  
  
      return root;
    }
  
    mountTo(parent) {
      this.render().mountTo(parent)
    }
  
  }