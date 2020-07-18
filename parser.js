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
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
270
271
272
273
274
275
276
277
278
279
280
281
282
283
284
285
286
287
288
289
290
291
292
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
362
363
364
365
366
367
368
369
370
371
372
373
374
375
376
377
378
379
380
381
382
383
384
385
386
387
388
389
390
391
392
393
394
395
396
397
398
399
400
401
402
403
404
405
406
407
408
409
410
411
412
413
414
415
416
417
418
419
420
421
422
423
424
425
426
427
428
429
430
431
432
433
434
435
436
437
438
439
440
441
442
let currentToken = null;
let currentAttribute = null;

let stack = [{type: "document", children:[]}];
let currentTextNode = null;

function emit(token){
    let top = stack[stack.length - 1];

    if(token.type == "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: []
        };

        element.tagName = token.tagName;

        for(let p in token) {
            if(p != "type" || p != "tagName")
                element.attributes.push({
                    name: p,
                    value: token[p]
                });
        }

        top.children.push(element);

        if(!token.isSelfClosing)
            stack.push(element);

        currentTextNode = null;
        
    } else if(token.type == "endTag") {
        if(top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!");
        } else {
            stack.pop();
        }
        currentTextNode = null;
    }  else if(token.type == "text") {
        if(currentTextNode == null) {
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

const EOF = Symbol("EOF");


function data(c){
    if(c == "<") {
        return tagOpen;
    } else if( c == EOF) {
        emit({
            type:"EOF"
        });
        return ;
    } else {
        emit({
            type:"text",
            content:c
        });
        return data;
    }
}

function tagOpen(c){
    if(c == "/") {
        return endTagOpen;
    } else if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "startTag",
            tagName : ""
        }
        return tagName(c);
    } else {
        emit({
            type: "text",
            content : c
        });
        return ;
    }
}

function tagName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == "/") {
        return selfClosingStartTag;
    } else if(c.match(/^[A-Z]$/)) {
        currentToken.tagName += c//.toLowerCase();
        return tagName;
    } else if(c == ">") {
        emit(currentToken);
        return data;
    } else {
        currentToken.tagName += c;
        return tagName;
    }
}
function beforeAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c);
    } else if(c == "=") {

    } else {
        currentAttribute = {
            name: "",
            value: ""
        }
        //console.log("currentAttribute", currentAttribute)
        return attributeName(c);
    }
}

function attributeName(c) {
    //console.log(currentAttribute);
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c);
    } else if(c == "=") {
        return beforeAttributeValue;
    } else if(c == "\u0000") {
    
    } else if(c == "\"" || c == "'" || c == "<") {
    
    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}


function beforeAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return beforeAttributeValue;
    } else if(c == "\"") {
        return doubleQuotedAttributeValue;
    } else if(c == "\'") {
        return singleQuotedAttributeValue;
    } else if(c == ">") {
        //return data;
    } else {
        return UnquotedAttributeValue(c);
    }
}

function doubleQuotedAttributeValue(c) {
    if(c == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if(c == "\u0000") {

    } else if(c == EOF) {
        
    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue
    }
}


function singleQuotedAttributeValue(c) {
    if(c == "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if(c == "\u0000") {

    } else if(c == EOF) {
        
    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue
    }
}

function afterQuotedAttributeValue (c){
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == "/") {
        return selfClosingStartTag;
    } else if(c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if(c == EOF) {
        
    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue
    }
}


function UnquotedAttributeValue(c) {

    if(c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if(c == "/") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if(c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if(c == "\u0000") {

    } else if(c == "\"" || c == "'" || c == "<" || c == "=" || c == "`") {

    } else if(c == EOF) {
        
    } else {
        currentAttribute.value += c;
        return UnquotedAttributeValue
    }
}

function selfClosingStartTag(c){
    if( c == ">") {
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if(c == "EOF") {

    } else {
        
    }
}

function endTagOpen(c){
    if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName : ""
        }
        return tagName(c);
    } else if(c == ">") {

    } else if(c == EOF) {
        
    } else {

    }
}
//in script
function scriptData(c){
    
    if(c == "<") {
        return scriptDataLessThanSign;
    } else {
        emit({
            type:"text",
            content:c
        });
        return scriptData;
    }
}
//in script received <
function scriptDataLessThanSign(c){
    if(c == "/") {
        return scriptDataEndTagOpen;
    } else {
        emit({
            type:"text",
            content:"<"
        });
        emit({
            type:"text",
            content:c
        });
        return scriptData;
    }
}
//in script received </
function scriptDataEndTagOpen(c){
    if(c == "s") {
        return scriptDataEndTagNameS;
    } else {
        emit({
            type:"text",
            content:"<"
        });

        emit({
            type:"text",
            content:"/"
        });

        emit({
            type:"text",
            content:"c"
        });
        return scriptData;
    }
}
//in script received </s
function scriptDataEndTagNameS(c){
    if(c == "c") {
        return scriptDataEndTagNameC;
    } else {
        emit({
            type:"text",
            content:"</s"
        });
        emit({
            type:"text",
            content:c
        });
        return scriptData;
    }
}

//in script received </sc
function scriptDataEndTagNameC(c){
    if(c == "r") {
        return scriptDataEndTagNameR;
    } else {
        emit({
            type:"text",
            content:"</sc"
        });
        emit({
            type:"text",
            content:c
        });
        return scriptData;
    }
}

//in script received </scr
function scriptDataEndTagNameR(c){
    if(c == "i") {
        return scriptDataEndTagNameI;
    } else {
        emit({
            type:"text",
            content:"</scr"
        });
        emit({
            type:"text",
            content:c
        });
        return scriptData;
    }
}
//in script received </scri
function scriptDataEndTagNameI(c){
    if(c == "p") {
        return scriptDataEndTagNameP;
    } else {
        emit({
            type:"text",
            content:"</scri"
        });
        emit({
            type:"text",
            content:c
        });
        return scriptData;
    }
}
//in script received </scrip
function scriptDataEndTagNameP(c){
    if(c == "t") {
        return scriptDataEndTag;
    } else {
        emit({
            type:"text",
            content:"</scrip"
        });
        emit({
            type:"text",
            content:c
        });
        return scriptData;
    }
}
//in script received </script
function scriptDataEndTag(c){
    if(c == " ") {
        return scriptDataEndTag;
    } if(c == ">") {
        emit({
            type: "endTag",
            tagName : "script"
        });
        return data;
    } else {
        emit({
            type:"text",
            content:"</script"
        });
        emit({
            type:"text",
            content:c
        });
        return scriptData;
    }
}

function afterAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if(c == "/") {
        return selfClosingStartTag;
    } else if(c == "=") {
        return beforeAttributeValue;
    } else if(c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if(c == EOF) {
        
    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name : "",
            value : ""
        };
        return attributeName(c);
    }
}

module.exports.parseHTML = function parseHTML(html){
    let state = data;
    for(let c of html) {
        state = state(c);
        if(stack[stack.length - 1].tagName === "script" && state == data) {
            state = scriptData;
        }
    }
    state = state(EOF);
    return stack[0];
}