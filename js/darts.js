class Darts {
    constructor(canvas) {
        let self = this;
        
        this.nxtPlayer = new Event('nextPlayer');
        this.resume = new Event('resume');
        this.pauseStart = new Event('pause');
        this.finishGame = new Event('gameFinish');
        
        
        this._rewriteAnimationFrameSupport.call(this);

        this._canvas = canvas;
        this._ctx = this._canvas.getContext("2d");
        this._hitCanvas = document.createElement("canvas");
        this._hitCtx = this._hitCanvas.getContext("2d");
        
        // document.getElementById("wrapper").appendChild(this._hitCanvas);
        
        this._ispaused = false;
        this.hitcolors = {};
        this.lastFired = "";
        
        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientHeight;
        
        this.mousepos = {
            x: self._canvas.width / 2,
            y: self._canvas.height / 2
        };

        this.keyboardmap = {};

        onkeydown = onkeyup = (e) => {
            // console.log(e.keyCode);
            this.keyboardmap[e.keyCode] = e.type == "keydown";

        };
        
        let pause = () => {
            
            if(self._ispaused) {
                return;
            }

            self._ispaused = true;

            self.cancelFrame();
            
            window.setTimeout(function() {
                self.keyboardmap = {};
                
                self.requestFrame(function(t) {
                    self.render.call(self);
                    self.pause.call(self);
                });
            }, 10);
            
            
        };
        
        window.onresize = pause;
        
        window.addEventListener('gameFinish', function() {
            window.setTimeout(function() {
                
                self.cancelFrame();
                self.gameFinish(self.players[self.curplayerID].name);

            }, 10);
            
            window.setTimeout(function() {
                location.reload();
            }, 10000);
        }, false);
        
        window.addEventListener('pause', function() {
            window.setTimeout(function() {
                pause();
            }, 10);
        }, false);
        window.addEventListener('resume', function() {
            window.setTimeout(function() {
                self.keyboardmap = {};
                
                self.cancelFrame();
                self.init(function(t) {
                    self.preRenderProcess.call(self, t);
                
                    self.startGame.call(self);
                    self.render.call(self);
                });
            }, 10);
        }, false);
        
        this._canvas.onmousemove = (e) => {
            self.mousepos.x = e.clientX;
            self.mousepos.y = e.clientY;
        };

        this.circle = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            random: 8,
            radius: 20,
            smallerRadius: function() {

                this.random = 2;
                this.radius = 5;

            },
            biggerRadius: function() {

                this.random = 8;
                this.radius = 20;

            },
            timer: 2000
        };
    }

    init(callback) {

        this._initTime = performance.now();
        this._ispaused = false;
        this.circle.biggerRadius();

        let self = this;
        self.requestFrame(function(t) {
            callback.call(self, t);
            // self.preRenderProcess.call(self, t);
            // self.render.call(self);
        });


    }

    // make some movements which will be rendered after this func (for exapmple: circle.x += timeoutPerFrame)
    preRenderProcess(timePassed) {
        this._timePerFrame = timePassed - this._initTime;
        this._initTime = timePassed,
        self = this;

        let canvas = this._canvas,
            circle = this.circle;

        checkControls();

        circle.x += this._random(-circle.random, circle.random);
        circle.y += this._random(-circle.random, circle.random);

        if (circle.x < 0) {
            circle.x = 0;
        }
        if (circle.y < 0) {
            circle.y = 0;
        }
        if (circle.x > canvas.width) {
            circle.x = canvas.width;
        }
        if (circle.y > canvas.height) {
            circle.y = canvas.height;
        }

        function checkControls() {
            let keyboardmap = self.keyboardmap,
                timePerFrame = self._timePerFrame,
                speed = timePerFrame * 0.2;

            if (keyboardmap[87]) {
                circle.y -= speed;
            }
            if (keyboardmap[83]) {
                circle.y += speed;
            }
            if (keyboardmap[68]) {
                circle.x += speed;
            }
            if (keyboardmap[65]) {
                circle.x -= speed;
            }
            if (keyboardmap[27]) {
                window.dispatchEvent(self.pauseStart);
            }
            if (keyboardmap[32]) {
                if (circle.timer <= 0) {
                    circle.timer = 0;
                    circle.biggerRadius();
                    circle.biggerRadius();
                    return;
                }

                circle.smallerRadius();
                
                circle.timer -= timePerFrame;

                if (circle.timer < 0) {
                    circle.timer = 0;
                }

            } else if (keyboardmap[32] === false) {
                self.circle.timer = 0;
                circle.biggerRadius();
            }
        }
    }

    render() {
        let ctx = this._ctx,
            hitCtx = this._hitCtx,
            canvas = this._canvas,
            circle = this.circle,
            self = this;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;        
        
        renderHitBox();
        renderDarts();
        
        

        let n = 0.5;

        var R = circle.radius,
        h = 4/2 * n,
        aB = 25 * n,
        bS = 10 * n,
        bB =  (2 * bS - 2 * h) ,
        kat1 = 3 *n,
        kat2 = 4 *n;
        
        
        for(let i = 0; i < 2 * Math.PI; i+=1/2 * Math.PI) {
            
            ctx.beginPath();
            ctx.translate(circle.x, circle.y);
            ctx.rotate(i);
            ctx.translate(-circle.x, -circle.y);
            
            ctx.moveTo(circle.x+R, circle.y+h);
            

            
            ctx.lineTo(circle.x+R+aB, circle.y+h+bS);
            ctx.lineTo(circle.x+R+aB+kat1, circle.y+h+bS-kat2);
            ctx.lineTo(circle.x+R+aB+kat1, circle.y+h+bS-kat2-bB);
            ctx.lineTo(circle.x+R+aB, circle.y+h+bS-bB-kat2-kat2);
            ctx.lineTo(circle.x+R, circle.y-h);
            ctx.lineTo(circle.x+R, circle.y+h);
            
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = "white";
            
            ctx.fill();
            ctx.stroke();
        }
        
        
        
        
        


        // ctx.beginPath();
        // ctx.fillStyle = "green";
        // ctx.fillRect(10, 10, 100, 100);
        // 
        // ctx.beginPath();
        // ctx.fillStyle = "red";
        // ctx.fillRect(200, 100, 50, 50);
        // ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "pink";
        ctx.fillRect(canvas.width - circle.timer / 10 - 20, 20, circle.timer / 10, 20);

        ctx.font = "19pt Arial";
        ctx.textAlign = "end";
        ctx.fillStyle = "red";
        ctx.fillText((circle.timer / 1000).toFixed(2) + " s", canvas.width - 21, 39);
        
        ctx.fillText(this.players[this.curplayerID].name, canvas.width - 21, 70);
        ctx.fillText(this.players[this.curplayerID].score, canvas.width - 21, 101);
        
        ctx.textAlign = "start";
        
        ctx.fillText((1000/this._timePerFrame).toFixed(2) + " fps", 21, canvas.height - 21);
        ctx.textAlign = "center";
        
        ctx.font = "40pt Arial";
        ctx.fillStyle = "#ffd700";
        ctx.textBaseline = "top";
        ctx.fillText(this.lastFired, canvas.width/2, 21);
        ctx.textBaseline = "alphabetic";

        ctx.fill();

        
        
        function renderDarts() {
            let m=2;
            let k=1;
            
            ctx.beginPath();
            ctx.arc(canvas.width/2, canvas.height/2, 200 * m, 0, 2*Math.PI);
            ctx.fillStyle = "black";
            ctx.fill();
            
            
            for (let i = 9 * Math.PI/180; i < 360 * Math.PI/180; i+=18 * Math.PI/180) {
                ctx.beginPath();
                if (k%2===0) {
                    ctx.fillStyle = "white";
                }else{
                    ctx.fillStyle = "black";
                }
                
                let inside = 145,
                    outside = 160;
                ctx.arc(canvas.width/2, canvas.height/2, outside * m, i, i+18 * Math.PI/180);
                ctx.lineTo(canvas.width/2, canvas.height/2);
                ctx.lineTo(canvas.width/2 + Math.cos(i) * outside * m, canvas.height/2 + Math.sin(i) * outside * m);
                ctx.moveTo(canvas.width/2 + Math.cos(i+18 * Math.PI/180) * outside * m, canvas.height/2 + Math.sin(i+18 * Math.PI/180) * outside * m);
                k++;
                ctx.fill();
                // ctx.stroke();
            }
            
            for (let i = 9 * Math.PI/180; i < 360 * Math.PI/180; i+=18 * Math.PI/180) {
                ctx.beginPath();
                if (k%2===0) {
                    ctx.fillStyle = "green";
                }else{
                    ctx.fillStyle = "red";
                }
                
                let inside = 145,
                    outside = 160;
                ctx.arc(canvas.width/2, canvas.height/2, outside * m, i, i+18 * Math.PI/180);
                ctx.lineTo(canvas.width/2 + Math.cos(i+18 * Math.PI/180) * inside * m, canvas.height/2 + Math.sin(i+18 * Math.PI/180) * inside * m);
                ctx.arc(canvas.width/2, canvas.height/2, inside * m, i+18 * Math.PI/180, i, true);
                ctx.lineTo(canvas.width/2 + Math.cos(i) * outside * m, canvas.height/2 + Math.sin(i) * outside * m);
                ctx.moveTo(canvas.width/2 + Math.cos(i+18 * Math.PI/180) * outside * m, canvas.height/2 + Math.sin(i+18 * Math.PI/180) * outside * m);
                k++;
                ctx.fill();
                // ctx.stroke();
            }
            
            for (let i = 9 * Math.PI/180; i < 360 * Math.PI/180; i+=18 * Math.PI/180) {
                
                ctx.beginPath();
                if (k%2===0) {
                    ctx.fillStyle = "green";
                }else{
                    ctx.fillStyle = "red";
                }
                
                let inside = 85,
                    outside = 100;
                ctx.arc(canvas.width/2, canvas.height/2, outside * m, i, i+18 * Math.PI/180);
                ctx.lineTo(canvas.width/2 + Math.cos(i+18 * Math.PI/180) * inside * m, canvas.height/2 + Math.sin(i+18 * Math.PI/180) * inside * m);
                ctx.arc(canvas.width/2, canvas.height/2, inside * m, i+18 * Math.PI/180, i, true);
                ctx.lineTo(canvas.width/2 + Math.cos(i) * outside * m, canvas.height/2 + Math.sin(i) * outside * m);
                ctx.moveTo(canvas.width/2 + Math.cos(i+18 * Math.PI/180) * outside * m, canvas.height/2 + Math.sin(i+18 * Math.PI/180) * outside * m);
                k++;
                ctx.fill();
                // ctx.stroke();
        
            }
            
            ctx.beginPath();
            
            ctx.arc(canvas.width/2, canvas.height/2, 15 * m, 0, 2*Math.PI);
            ctx.fill();
            // ctx.stroke();
            
            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.arc(canvas.width/2, canvas.height/2, 15/2 * m, 0, 2*Math.PI);
            
            ctx.fill();
            // ctx.stroke();
            
            let inside = 160,
                outside = 185;
            let nums = [13, 4, 18, 1, 20, 5, 12, 9, 14, 11, 8, 16, 7, 19, 3, 17, 2, 15, 10, 6];
            nums.reverse();
            for (let i = 0 * Math.PI/180; i < 360 * Math.PI/180; i+=18 * Math.PI/180) {
                ctx.beginPath();
                ctx.translate(canvas.width/2 + Math.cos(i) * outside * m, canvas.height/2 + Math.sin(i) * outside * m);
                
                if (canvas.height/2 + Math.sin(i) * outside * m < canvas.height/2 || i === 0 || i === Math.PI) {
                    ctx.rotate(i+90* Math.PI/180);
                }else{
                    ctx.rotate(i-90* Math.PI/180);
                }
                
                ctx.translate(-canvas.width/2 - Math.cos(i) * outside * m, -canvas.height/2 - Math.sin(i) * outside * m);
                
                
                ctx.font = 19*m + "pt Arial";
                ctx.textAlign = "center";
                ctx.textBaseline="middle";
                ctx.fillStyle = "white";
                ctx.fillText(nums.shift(), canvas.width/2 + Math.cos(i) * outside * m, canvas.height/2 + Math.sin(i) * outside * m);
                ctx.textBaseline="alphabetic";
                ctx.fill();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
            ctx.closePath();
        }
        
        
        function randColor() {
            let c = {
                r: Math.round(255 * Math.random()),
                g: Math.round(255 * Math.random()),
                b: Math.round(255 * Math.random())
            }
            
            return `rgb(${c.r},${c.g},${c.b})`
        }
        
        function renderHitBox() {
            let m=2;
            let k=1;
            
            self.hitcolors = {};
            self._hitCanvas.width = self._canvas.width;
            self._hitCanvas.height = self._canvas.height;
                    
            let ctx = hitCtx,
                color = "";
                
            
            let nums = [6, 13, 4, 18, 1, 20, 5, 12, 9, 14, 11, 8, 16, 7, 19, 3, 17, 2, 15, 10];
            
            let num = nums.slice().reverse();
            for (let i = 9 * Math.PI/180; i < 360 * Math.PI/180; i+=18 * Math.PI/180) {
                
                
                ctx.beginPath();
                
                while(true) {
                    let c = randColor();
                    if(!self.hitcolors[c]) {
                        self.hitcolors[c] = {};
                        self.hitcolors[c].m = 1;
                        self.hitcolors[c].s = num.shift();
                        color = c;
                        break;
                    }
                }
                

                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                
                let inside = 145,
                    outside = 160;
                ctx.arc(canvas.width/2, canvas.height/2, outside * m, i, i+18 * Math.PI/180);
                ctx.lineTo(canvas.width/2, canvas.height/2);
                ctx.lineTo(canvas.width/2 + Math.cos(i) * outside * m, canvas.height/2 + Math.sin(i) * outside * m);
                ctx.moveTo(canvas.width/2 + Math.cos(i+18 * Math.PI/180) * outside * m, canvas.height/2 + Math.sin(i+18 * Math.PI/180) * outside * m);
                k++;
                ctx.fill();
                ctx.stroke();
            }
            
            
            num = nums.slice().reverse();
            for (let i = 9 * Math.PI/180; i < 360 * Math.PI/180; i+=18 * Math.PI/180) {
                ctx.beginPath();
                
                while(true) {
                    let c = randColor();
                    if(!self.hitcolors[c]) {
                        self.hitcolors[c] = {};
                        self.hitcolors[c].m = -1;
                        self.hitcolors[c].s = num.shift() * 2;
                        color = c;
                        break;
                    }
                }
                
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                
                let inside = 145,
                    outside = 160;
                ctx.arc(canvas.width/2, canvas.height/2, outside * m, i, i+18 * Math.PI/180);
                ctx.lineTo(canvas.width/2 + Math.cos(i+18 * Math.PI/180) * inside * m, canvas.height/2 + Math.sin(i+18 * Math.PI/180) * inside * m);
                ctx.arc(canvas.width/2, canvas.height/2, inside * m, i+18 * Math.PI/180, i, true);
                ctx.lineTo(canvas.width/2 + Math.cos(i) * outside * m, canvas.height/2 + Math.sin(i) * outside * m);
                ctx.moveTo(canvas.width/2 + Math.cos(i+18 * Math.PI/180) * outside * m, canvas.height/2 + Math.sin(i+18 * Math.PI/180) * outside * m);
                k++;
                ctx.fill();
                ctx.stroke();
            }
            
            num = nums.slice().reverse();
            for (let i = 9 * Math.PI/180; i < 360 * Math.PI/180; i+=18 * Math.PI/180) {
                
                ctx.beginPath();
                
                while(true) {
                    let c = randColor();
                    if(!self.hitcolors[c]) {
                        self.hitcolors[c] = {};
                        self.hitcolors[c].m = 3;
                        self.hitcolors[c].s = num.shift() * 3;
                        color = c;
                        break;
                    }
                }
                
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                
                let inside = 85,
                    outside = 100;
                ctx.arc(canvas.width/2, canvas.height/2, outside * m, i, i+18 * Math.PI/180);
                ctx.lineTo(canvas.width/2 + Math.cos(i+18 * Math.PI/180) * inside * m, canvas.height/2 + Math.sin(i+18 * Math.PI/180) * inside * m);
                ctx.arc(canvas.width/2, canvas.height/2, inside * m, i+18 * Math.PI/180, i, true);
                ctx.lineTo(canvas.width/2 + Math.cos(i) * outside * m, canvas.height/2 + Math.sin(i) * outside * m);
                ctx.moveTo(canvas.width/2 + Math.cos(i+18 * Math.PI/180) * outside * m, canvas.height/2 + Math.sin(i+18 * Math.PI/180) * outside * m);
                k++;
                ctx.fill();
                ctx.stroke();
        
            }
            
            ctx.beginPath();
            
            while(true) {
                let c = randColor();
                if(!self.hitcolors[c]) {
                    self.hitcolors[c] = {};
                    self.hitcolors[c].m = -1;
                    self.hitcolors[c].s = 25;
                    color = c;
                    break;
                }
            }
            
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            
            ctx.arc(canvas.width/2, canvas.height/2, 15 * m, 0, 2*Math.PI);
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            
            while(true) {
                let c = randColor();
                if(!self.hitcolors[c]) {
                    self.hitcolors[c] = {};
                    self.hitcolors[c].m = -1;
                    self.hitcolors[c].s = 50;
                    color = c;
                    break;
                }
            }
            
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.arc(canvas.width/2, canvas.height/2, 15/2 * m, 0, 2*Math.PI);
            
            ctx.fill();
            ctx.stroke();
            
            ctx.closePath();
        }
        
    }

    pause() {
        let ctx = this._ctx,
            canvas = this._canvas;

        if(this.keyboardmap[27]) {
            window.dispatchEvent(this.resume);
            return;
        }

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        ctx.fill();

        ctx.font = "60pt Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "red";
        ctx.textBaseline="middle";
        ctx.fillText("PRESS esc TO CONTINUE", canvas.width / 2, canvas.height / 2);
        ctx.textBaseline="alphabetic";
        ctx.fill();
    }
    
    startGame(t) {     
        let self = this,
            hitCtx = this._hitCtx;
           
        this.players = this.players || [
            {
                name: "player 1",
                score: 301,
                shoots: 3
            },
            {
                name: "player 2",
                score: 301,
                shoots: 3
            }
        ];
        
        this.curplayerID = this.curplayerID || 0;
        
        let player = this.players[this.curplayerID];
         
        if(this.keyboardmap[13] && this.firing === false) {
            fire();
        }else if(!this.keyboardmap[13]) {
            this.firing = false;
        }
        
        checkPlayer(player);
        
        function checkPlayer() {
            if(player.score === 0) {
                window.dispatchEvent(self.finishGame);
                return;
                // self.gameFinish(player.name);
                // debugger;
            }
            if(player.shoots === 0) {
                player.shoots = 3;
                nextPlayer();
            }
            
            
        }
        
        function getScore() {
            let pixel = hitCtx.getImageData(self.circle.x, self.circle.y, 1, 1).data;
            let res = self.hitcolors[`rgb(${pixel[0]},${pixel[1]},${pixel[2]})`];
            if (!res) {
                res = {};
                res.s = 0;
                res.m = 1;
            }
            self.lastFired = res.s;
            if(self.players[self.curplayerID].score - res.s < 2 && self.players[self.curplayerID].score - res.s !== 0) {
                self.players[self.curplayerID].shoots = 0;
                return self.players[self.curplayerID].score;
            }
            
            if(self.players[self.curplayerID].score - res.s === 0) {
                if (res.m < 0) {
                    return 0;
                }
                self.players[self.curplayerID].shoots = 0;
                return self.players[self.curplayerID].score;
            }
            
            return self.players[self.curplayerID].score - res.s;
        }
        
        function nextPlayer() {
            self.circle.timer = 2000;
            self.curplayerID++;
            if(self.players.length - 1 < self.curplayerID) {
                self.curplayerID = 0;
            }
            
            window.dispatchEvent(self.pauseStart);
            
            
        }
        
        function fire() {
            // window.dispatchEvent(self.finishGame);
            
            self.lastFired = self.lastFired || "";
            self.firing = true;
            console.log("fire");
            player.shoots--;
            player.score = getScore();
            
            self.circle.x = self._canvas.width / 2;
            self.circle.y = self._canvas.height / 2;
        }
    }
    
    gameFinish(name) {
        let self = this;
            
        onkeydown = onkeyup = function() {};
        window.onresize = function() {};
        
        this.init(function(t) {
            self.preRenderProcess.call(self, t);
            self.renderGameFinish.call(self, name);
        });
    }
    
    renderGameFinish(name) {
        let canvas = this._canvas,
            ctx = this._ctx;
        
        
        
        this.backgroundAlpha = (this.backgroundAlpha - this._timePerFrame * 0.0005) || 1.0;
        if (this.backgroundAlpha < 0.5) {
            this.backgroundAlpha = 0.5;
        }
            
        console.log(this.backgroundAlpha);
            
            
        
        ctx.beginPath();
        ctx.globalAlpha = this.backgroundAlpha;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.globalAlpha = 0.3;
        
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        
        
        ctx.beginPath();
        ctx.moveTo(0, canvas.height/3);
        ctx.globalAlpha = 0.8;
        ctx.lineTo(canvas.width, canvas.height/5);
        ctx.lineTo(canvas.width, 3 * canvas.height/5);
        ctx.lineTo(0, 2 * canvas.height/3);
        ctx.lineTo(0, canvas.height/3);
        
        
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        ctx.fillStyle = "white";
        ctx.font = "60pt Arial";
        ctx.textBaseline="bottom";
        ctx.fillText("WINNER - " + this.players[this.curplayerID].name, canvas.width / 2, canvas.height / 2);
        ctx.textBaseline="alphabetic";
    }
    
    renderStartScene(t) {
        let ctx = this._ctx,
            canvas = this._canvas;
            
        if(this.keyboardmap[27]) {
            window.dispatchEvent(this.resume);
            return;
        }
            
        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientHeight;
        
        this._ispaused = true;
            
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        ctx.fill();

        ctx.font = "60pt Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "red";
        ctx.textBaseline="middle";
        ctx.fillText("PRESS esc TO START", canvas.width / 2, canvas.height / 2);
        ctx.textBaseline="alphabetic";
        ctx.fill();
    }

    requestFrame(callback) {

        let self = this;
        self.requestID = window.requestAnimationFrame(function cb(timePassed) {
            callback(timePassed);

            // console.log(self.keyboardmap);

            self.requestID = window.requestAnimationFrame(cb);
        });

    }

    cancelFrame() {
        window.cancelAnimationFrame(this.requestID);
    }

    _rewriteAnimationFrameSupport() {
        if (!window.requestAnimationFrame) {

            let self = this;
            this._animationStart = Date.now();

            window.requestAnimationFrame = (function() {

                return function(callback) {

                    return window.setTimeout(function() {

                        callback(Date.now() - self._animationStart);

                    }, 1000 / 24);

                };
            })();
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = (function() {
                return function(id) {

                    window.clearTimeout(id);

                };
            })();
        }
    }

    _random(min, max) {
        return Math.random() * (max - min) + min;
    }
}