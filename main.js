1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
function createElement(Cls, attributes, ...children){
    
    let o;

    if(typeof Cls === "string") {
        o = new Wrapper(Cls);
    } else {
        o = new Cls({
            timer: {}
        });
    }



    for(let name in attributes) {
        o.setAttribute(name, attributes[name]);
    }

    //console.log(children);
    console.log(o);
    for(let child of children) {
        if(typeof child === "string")
            child = new Text(child);

        o.appendChild(child);
    }

    return o;
}

class Text {
    constructor(text){
        this.children = [];
        this.root = document.createTextNode(text);
    }
    mountTo(parent){
        parent.appendChild(this.root);
    }
}

class Wrapper{
    constructor(type){
        this.children = [];
        this.root = document.createElement(type);
    }

    setAttribute(name, value) { //attribute
        this.root.setAttribute(name, value);
    }

    appendChild(child){
        this.children.push(child);

    }

    mountTo(parent){
        parent.appendChild(this.root);

        for(let child of this.children){
            child.mountTo(this.root);
        }
    }

}

class MyComponent {
    constructor(config){
        this.children = [];
        this.attributes = new Map();
        this.properties = new Map();
    }

    setAttribute(name, value) { //attribute
        // this.root.setAttribute(name, value);
        this.attributes.set(name, value);
    }

    appendChild(child){
        this.children.push(child);
    }

    set title(value) {
      this.properties.set("title", value)
    }

    render(){
        
        return <article>
            <h1>{this.attributes.get("title")}</h1>
            <h1>{this.properties.get("title")}</h1>
            <header>I'm a header</header>
            {this.slot}
            <footer>I'm a footer</footer>
        </article>
    }

    mountTo(parent){
        this.slot = <div></div>
        for(let child of this.children){
            this.slot.appendChild(child)
        }
        this.render().mountTo(parent)

    }


}


/*let component = <div id="a" cls="b" style="width:100px;height:100px;background-color:lightgreen">
        <div></div>
        <p></p>
        <div></div>
        <div></div>
    </div>*/

let component = <MyComponent title="hhhh">
    <div>text text text</div>
</MyComponent>
    
component.title = "hehehe"

component.mountTo(document.body);
/*
var component = createElement(
    Parent, 
    {
        id: "a",
        "class": "b"
    }, 
    createElement(Child, null), 
    createElement(Child, null), 
    createElement(Child, null)
);
*/

console.log(component);

//componet.setAttribute("id", "a");




// // 框架代码
// function createElement(Cls, attributes, ...children){

//   let o = new Cls({
//       timer: {}
//   });

//   for(let name in attributes) {
//     o.setAttribute(name, attributes[name]);
//   }

//   for(let child of children) {
//     o.children.push(child);
//   }

//   return o;
// }

// // 用户代码
// class Parent {

//   constructor(config){
//     this.children = [];
//   }

//   set class(v){ //property
//     console.log("Parent::class", v)
//   }

//   set id(v){ //property
//     console.log("Parent::id", v)
//   }

//   setAttribute(name, value) { //attribute
//     console.log(name, value);
//   }

// }

// class Child {
//   set class(v) {
//     console.log("Child: class")
//   }
// }

// let component = <Parent id="a" class="b">
//     <Child></Child>
//     <Child></Child>
//     <Child></Child>
//   </Parent>

// console.log(component)