---
layout:    "post"
title:     "Minesweeper using HTML5"
comments:  yes
tags: javascript html css
---

Obviously, everyone was born before the year 2000 knows the famous classic game 'Minesweeper'. To me, I knew this game when I was little at the time where Windows XP was ruling everywhere. It is funny because at that time I did not know exactly how the game is played. That time the game was some kind of a luck game to me where you try to eliminate all the squares except the ones with mines until you either win or lose :laughing:.

Until recently, a friend pointed out that they saw a video of a guy who made a fully perfect AI to solve the game. I liked the idea so I decided to make one. I started by learning how the game works and it turned out to be very simple. There is a certain number of mines in the game and the player has to discover where these mines are to win the game. Every square has a weight that shows how many mines they are within the surrounding 8 squares of that particular square. If the weight was zero the game will reveal all the surrounding squares except the ones with the mines, otherwise, it will reveal the square itself. Although things did not go very well with the idea, I ended up making the game only.

### How does it work?

With the help of HTML5 canvas element, you can draw geometric objects. We can achieve this dynamically using JavaScript. First, we create a canvas element in the page:

{% highlight html %}
<canvas id="example" width="500" height="500">Any text here will get displayed if the browser does not support HTML5 canvas</canvas>
{% endhighlight %}

Then we use JavaScript to create objects and control their properties:

{% highlight javascript %}
var canvas = document.getElementById("example");
var context = canvas.getContext("2d");
context.beginPath();
context.fillStyle = 'red';
context.fillRect(0, 0, 10, 10);
context.closePath();
{% endhighlight %}

This will create a square with side equals to 10 and a position of (0, 0). Easy and simple.

### Minesweeper

Coming from an Object-Oriented Programming mentality, I wanted the ability to create classes just because I am used to it this way :smiley:. I was surprised when I knew that you can mimic creating [classes in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes "Classes - JavaScript"){:target="_blank"} . 

I started by questioning what attributes each square has? And I came up with these: isMine, isFlagged, isDown, x, y, and weight. isMine tells if a square is a mine. isFlagged is when a square is being flagged or marked. isDown if a square is revealed. x and y hold the location in the game. weight is a number greater than zero where it holds how many mines within its surrounding squares. With these attributes I came with this JS class:

{% highlight javascript %}
class square {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isDown = false;
        this.isMine = false;
        this.isDown = false;
        this.weight = 0;
    }
    get x() { return this._x; }
    set x(value) { this._x = value; }
    get y() { return this._y; }
    set y(value) { this._y = value; }
    get weight() { return this._weight; }
    set weight(value) { this._weight = value; }
    get isDown() { return this._isDown; }
    set isDown(value) {
        this._isDown = value;
        if (this.isMine) {
            end = true;
        }
    }
    get isMine() { return this._isMine; }
    set isMine(value) { this._isMine = value; }
    get isFlagged() { return this._isFlagged; }
    set isFlagged(value) {
        this._isFlagged = value;
        if (value)
            numberofmines = (numberofmines <= 0) ? 0: numberofmines - 1;
        else
            numberofmines++;
        updateHeader();
    }
}
{% endhighlight %}

The game does not have a loop, it contains two main functions. The first one is called to initialize the game environment like setting mouse event handler. Here is where all the magic happens, whenever the user clicks the first click the timer starts and it passes the click to the game. If it was inside the game frame where the squares are located it will register a click for that square. Otherwise, it will start a new game. Which is the second function, the previous function is only called once. This one is called to clear all the previous data in the game and create a start a new game. Obviously, this is done with the help of other functions to make it a little more organized.

### Source code

The source code is available at [JSMinesweeper](https://github.com/aymanbagabas/jsminesweeper "JSMinesweeper - AymanBagabas"){:target="_blank"} or you can try it out [here](https://aymanbagabas.com/jsminesweeper "JSMinesweeper"){:target="_blank"} .
