<template>
  <div id="maincontent" ref="maincontent">
    <div id="posel" noselect>{{ position }} {{ zoom }}x</div>
    <div id="place" noselect v-on:click="showPalette()" @click="show =! show" v-if="!show">💥</div>
    <div id="ishide" noselect v-on:click="hidePalette()" v-if="show" @click="show =! show">❌</div>
    <canvas id="canvas" ref="canvas" width="0" height="0" noselect></canvas>
    <div id="canvparent1" ref="canvparent1" noselect></div>
    <div id="canvparent2" ref="canvparent2" noselect>
      <div id="canvselect" ref="canvselect">
        <img @click="show = !show;show ? showPalette():hidePalette()" src="../assets/pixel-select.svg" style="position: absolute; top: -10%; left: -10%; width: 120%; height: 120%;" draggable="false">
      </div>
      <img id="templateImage" ref="templateImage" width="auto" height="auto" draggable="false">
    </div>

    <div id="palette" ref="palette" style="transform: translateY(100%)" noselet>
      <div id="colours" ref="colours" v-on:click="colourSelect"></div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      connectMessage: '已连接',
      isPaleteOpen: false,
      show: false,
      PALETTE:[
        0xff1a006d, 
        0xff3900be, 
        0xff0045ff, 
        0xff00a8ff, 
        0xff35d6ff, 
        0xffb8f8ff, 
        0xff68a300, 
        0xff78cc00, 
        0xff56ed7e, 
        0xff6f7500, 
        0xffaa9e00, 
        0xffc0cc00, 
        0xffa45024, 
        0xffea9036, 
        0xfff4e951, 
        0xffc13a49, 
        0xffff5c6a, 
        0xffffb394, 
        0xff9f1e81, 
        0xffc04ab4, 
        0xffffabe4, 
        0xff7f10de, 
        0xff8138ff, 
        0xffaa99ff, 
        0xff2f486d, 
        0xff26699c, 
        0xff70b4ff, 
        0xff000000, 
        0xff525251, 
        0xff908d89, 
        0xffd9d7d4, 
        0xffffffff],
      WIDTH: 500,
      HEIGHT: 500,
      position: '(0, 0)',
      zoom: 2.5,
      touch1: null,
      touch2: null,
      touchmoved: 15,
      move: 3,
      moved:3,
      selX: 0,
      selY: 0,
      canvasCtx: null,
      x:null,
      y:null,
      z:null,
      board: null,
      minZoom: null,
      click:false,
      mx: 0,
      my: 0,
      anim: null,
      PEN: -1,
      arrowkeyDown:{
        left: false,
        right: false,
        up: false,
        down: false
      }
    }
  },
  mounted() {
    document.body.addEventListener("touchstart", this.handleTouchStart)
    document.body.addEventListener("touchend", this.handleTouchEnd)
    document.body.addEventListener("mousedown", this.handleMouseDown)
    document.addEventListener("mouseup",this.handleMouseUp)
    document.body.addEventListener("keyup", this.handleKeyUp)
    document.body.addEventListener("mousemove", this.handleMouseMove)
    document.body.addEventListener("wheel", this.handleWheel)
    document.body.addEventListener("touchmove", this.handleTouchMove)
    oncontextmenu = e => {
      e.preventDefault()
    }
    this.setsize(this.WIDTH, this.HEIGHT)
    this.generatePalette()
  },
  beforeUnmount() {
    document.body.removeEventListener("touchstart", this.handleTouchStart)
    document.body.removeEventListener("touchend", this.handleTouchEnd)
    document.body.removeEventListener("mousedown", this.handleMouseDown)
    document.removeEventListener("mouseup",this.handleMouseUp)
    document.body.removeEventListener("keyup", this.handleKeyUp)
    document.body.removeEventListener("mousemove", this.handleMouseMove)
    document.body.removeEventListener("touchmove", this.handleTouchMove)
    document.body.removeEventListener("wheel", this.handleWheel)
  },
  methods:{
    setsize(w, h = w) {
      this.$refs.canvas.width = this.WIDTH = w
      this.$refs.canvas.height = this.HEIGHT = h
      this.$refs.canvparent1.style.width = `${w}px`
      this.$refs.canvparent1.style.height = `${h}px`
      this.$refs.canvparent2.style.width = `${w}px`
      this.$refs.canvparent2.style.height = `${h}px`
      this.board = new Uint8Array(w * h).fill(255)
      this.x = +localStorage.x || this.WIDTH / 2
      this.y = +localStorage.y || this.HEIGHT / 2
      this.z = +localStorage.z || 0.2
      for (let [k, v] of new URLSearchParams(location.search)) {
        v *= 1
        if (v != v) continue
        switch (k) {
          case 'x':
            this.x = v
            break
          case 'y':
            this.y = v
            break
          case 'z':
            this.z = v
            break
          case 'err':
            onerror = alert
            break
          case 'debug':
            break
        }
      }
      this.onresize()
    },
    onresize() {
      this.minZoom = Math.min(window.innerWidth / this.$refs.canvas.width, this.$refs.maincontent.offsetHeight / this.$refs.canvas.height) / 100
      this.pos()
    },
    pos() {
      if (this.z < this.minZoom) this.z = this.minZoom
      if (this.z > 1) this.z = 1

      let right = this.x - this.$refs.canvas.width + 0.01
      let left = this.x
      let up = this.y - this.$refs.canvas.height + 0.01
      let down = this.y

      if (right >= left) this.x = 0
      else if (right > 0) this.x -= right
      else if (left < 0) this.x -= left
      if (up >= down) this.y = 0
      else if (up > 0) this.y -= up
      else if (down < 0) this.y -= down
      this.position = `(${Math.floor(this.x)},${Math.floor(this.y)})`
      this.zoom = this.z > 0.02 ? Math.round(this.z * 50) / 10 : Math.ceil(this.z * 500) / 100
      localStorage.x = Math.floor(this.x) + 0.5
      localStorage.y = Math.floor(this.y) + 0.5
      localStorage.z = this.z
      this.transform()
    },
    transform() {
      this.$refs.canvparent1.style.transform = this.$refs.canvparent2.style.transform = `translate(${this.x * this.z * -50 + innerWidth / 2}px, ${this.y * this.z * -50 + this.$refs.maincontent.offsetHeight / 2}px) scale(${this.z * 50})`
      this.$refs.canvselect.style.transform = `translate(${Math.floor(this.x)}px, ${Math.floor(this.y)}px) scale(0.01)`
      this.$refs.canvas.style.width = `${this.z * this.$refs.canvas.width * 50}px`
      this.$refs.canvas.style.height = `${this.z * this.$refs.canvas.height * 50}px`
      this.$refs.canvas.style.transform = `translate(${this.x * this.z * -50}px, ${this.y * this.z * -50}px)`
      this.$refs.canvas.style.imageRendering = this.z < 1 / 50 / devicePixelRatio ? 'initial' : ''
    },
    clicked(clientX,clientY) {
      clearInterval(this.anim)
      clientX = Math.floor(this.x + (clientX - innerWidth /2) / this.z / 50) + 0.5
      clientY = Math.floor(this.y + (clientY - this.$refs.maincontent.offsetHeight /2) / this.z / 50) + 0.5
      this.anim = setInterval(() => {
      this.x += (clientX - this.x) / 10
      this.y += (clientY - this.y) / 10
      this.pos()
      if (Math.abs(clientX - this.x) + Math.abs(clientY - this.y) < 0.1) clearInterval(this.anim)
        },15)
    },
    zoomIn() {
      if (this.z >= 0.4) return
      clearInterval(this.anim)
      let dz = 0.005
      this.anim = setInterval(() => {
        this.z += dz
        this.pos()
        if (this.z >= 0.4) clearInterval(this.anim)
      }, 15)
    },
    zoomOut() {
      if (this.z <= 0.1) return
      clearInterval(this.anim)
      let dz = -0.005
      this.anim = setInterval(() => {
        this.z += dz
        this.pos()
        if (this.z <= 0.2) clearInterval(this.anim)
      }, 15)
    },
    showPalette() {
      this.$refs.palette.style.transform = ''
      this.zoomIn()
    },

    hidePalette() {
      this.$refs.canvselect.style.background = ''
      this.$refs.palette.style.transform = 'translateY(100%)'
      if (this.PEN != -1) {
        this.$refs.colours.children[this.PEN].classList.remove('sel')
        this.PEN = -1
      }
      // pok.classList.remove('enabled')
      this.$refs.canvselect.children[0].style.display = 'block'
      this.$refs.canvselect.style.outline = ''
      this.$refs.canvselect.style.boxShadow = ''
      this.zoomOut()
    },

    generatePalette() {
		// eslint-disable-next-line
		this.$refs.colours.innerHTML = this.PALETTE.map((colour, i) =>
				`<div style='background:rgba(${colour & 255},${(colour >> 8) & 255},${(colour >> 16) & 255}, 1)${colour == 0xffffffff ? "; outline: 1px #ddd solid; outline-offset: -1px" : ""}'><span></span></div>`
			).join("")
    },

    colourSelect(e) {
        let i = [...this.$refs.colours.children].indexOf(e.target)
        if (i < 0) return
        let el = this.$refs.colours.children[this.PEN]
        if (el) {
            if (el === e.target) { // 如果点击的是已选中的颜色，则取消选择
                el.classList.remove('sel')
                this.$refs.canvselect.style.background = ''
                this.PEN = -1
                this.$refs.canvselect.children[0].style.display = 'block';
                this.$refs.canvselect.style.outline = ''
                this.$refs.canvselect.style.boxShadow = ''
            } else {
                el.classList.remove('sel')
                this.PEN = i
                this.$refs.canvselect.style.background = e.target.style.background
                e.target.classList.add('sel')
                this.$refs.canvselect.children[0].style.display = 'none';
                this.$refs.canvselect.style.outline = '8px white solid';
                this.$refs.canvselect.style.boxShadow = '0px 2px 4px 0px rgb(0 0 0 / 50%)'
            }
        } else {
            this.PEN = i
            this.$refs.canvselect.style.background = e.target.style.background
            e.target.classList.add('sel')
            this.$refs.canvselect.children[0].style.display = 'none';
            this.$refs.canvselect.style.outline = '8px white solid';
            this.$refs.canvselect.style.boxShadow = '0px 2px 4px 0px rgb(0 0 0 / 50%)'
        }
    },
	//这段代码定义了set函数，用于在指定位置绘制指定颜色的像素，
	set(x, y, b) {
		
	},
	put(){
		
		set(Math.floor(x), Math.floor(y), PEN)
		canvselect.children[0].style.display='block'
		canvselect.style.outline = ""
		canvselect.style.boxShadow = ""
		AUDIOS.cooldownStart.run()
		CD = Date.now() + (localStorage.vip ? (localStorage.vip[0] == '!' ? 0 : COOLDOWN/2) : COOLDOWN)

		let pixelView = new DataView(new Uint8Array(6).buffer)
		pixelView.setUint8(0, 4)
		pixelView.setUint32(1, Math.floor(x) + Math.floor(y) * WIDTH)
		pixelView.setUint8(5, PEN)
		PEN = -1
		localStorage.placed = (localStorage.placed >>> 0) + 1
		call(send, ws, pixelView)
	},
    // 以下开始写事件监听器
    handleTouchStart(e) {
      for (let t of e.changedTouches) {
				if (!this.touch1){
          this.touch1 = t
          this.touchmoved = 15
        } else if (!this.touch2) {
          this.touch2 = t
        } else {
          [this.touch1, this.touch2] = [this.touch2, t]
        }
			}
    },
    handleTouchEnd(e) {
      for (let t of e.changedTouches) {
        if (this.touch1 && this.touch1.identifier == t.identifier) {
          this.touch1 = null
          this.touchmoved = 0
        } else if (this.touch2 && this.touch2.identifier == t.identifier) {
          this.touch2 = null
        }
      }
    },
    handleTouchMove(e) {
      for (let t of e.changedTouches) {
        clearInterval(this.anim)
        if (!this.touch2 && this.touch1 && this.touch1.identifier == t.identifier) {
          this.touchmoved -= Math.abs(t.clientY - this.touch1.clientY) + Math.abs(t.clientX - this.touch1.clientX)
          if (e.target != this.$refs.maincontent && !this.$refs.canvparent2.contains(e.target)) break
          this.x -= (t.clientX - this.touch1.clientX) / (this.z * 50)
          this.y -= (t.clientY - this.touch1.clientY) / (this.z * 50)
          this.pos()
        } else if (this.touch1 && this.touch2) {
          if (e.target != this.$refs.maincontent && !this.$refs.canvparent2.contains(e.target)) break
          const touch = this.touch1.identifier == t.identifier ? this.touch1 : (this.touch2.identifier == t.identifier ? this.touch2 : null)
          if (!touch) break
          let other = touch == this.touch1 ? this.touch2 : this.touch1
          this.x -= (t.clientX - touch.clientX) / (this.z * 50)
          this.y -= (t.clientY - touch.clientY) / (this.z * 50)
          this.touchmoved -= Math.abs(t.clientY - touch.clientY) + Math.abs(t.clientX - touch.clientX)
          let dx = touch.clientX - other.clientX
          let dy = touch.clientY - other.clientY
          let a = dx * dx + dy * dy
          dx = t.clientX - other.clientX
          dy = t.clientY - other.clientY
          a = Math.sqrt((dx * dx + dy * dy) / a)
          this.z *= a
          this.pos()
        }
        if (this.touch1 && this.touch1.identifier == t.identifier) this.touch1 = t
        else if (this.touch2 && this.touch2.identifier == t.identifier) this.touch2 = t
      }
    },
    handleMouseDown(e) {
      this.move = 3
      this.click = e.button + 1
    },
    handleMouseUp(e) {
      if (e.target != this.$refs.maincontent && !this.$refs.canvparent2.contains(e.target))
				return (this.moved = 3, this.click = 0)

			if (this.moved > 0 && this.$refs.canvparent2.contains(e.target)) {
				this.clicked(e.clientX, e.clientY)
			}

			this.moved = 3
			this.click = 0
    },
    handleKeyUp(e) {
      let i = 10
      let repeatFunc = setInterval(
        () => {
          switch (e.keyCode) {
            case 37:
              this.x -= i / 55
              this.arrowkeyDown.left = false
              break 
            case 38:
              this.y -= i / 55
              this.arrowkeyDown.up = false
              break
            case 39:
              this.x += i / 55
              this.arrowkeyDown.right = false
              break
            case 40:
              this.y += i / 55
              this.arrowkeyDown.down = false
              break
          }
          this.pos()
          i--
          if (i <= 0) clearInterval(repeatFunc)
        },16)
    },
    handleMouseMove(e) {
    if (e.target != this.$refs.maincontent && !this.$refs.canvparent2.contains(e.target)) return
      this.moved --
      let dx = -(this.mx - (this.mx = e.clientX - innerWidth / 2))
      let dy = -(this.my - (this.my = e.clientY - this.$refs.maincontent.offsetHeight / 2))
      if (dx != dx || dy != dy) return
      if (this.click) {
        this.x -= dx / (this.z * 50)
        this.y -= dy / (this.z * 50)
        this.pos()
        clearInterval(this.anim)
      }
    },
    handleWheel(e) {
      if (e.target != this.$refs.maincontent && !this.$refs.canvparent2.contains(e.target)) return
        let d = Math.max(this.minZoom / this.z, Math.min(3 ** Math.max(-0.5, Math.min(0.5, e.deltaY * -0.01)),1 / this.z))
        this.z *= d
        this.x += this.my * (d - 1) / this.z / 50
        this.y -= this.mx * (d - 1) / this.z / 50
        this.pos()
    },
  }
  
}
</script>

<style>

* { margin: 0; padding: 0; touch-action: none } *, *::before, *::after { box-sizing: border-box } body, html{ width: 100%; height: 100%; overflow: hidden; position: absolute }

html {
	overscroll-behavior: none;
	font-size: 14px;
	font-family: bold;
	-webkit-tap-highlight-color: transparent;
	-webkit-touch-callout: none;
}

[noselect] {
	user-select: none;
	-webkit-user-select: none;
}

body{
	transition: background-color .3s;
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: absolute;
	transition: left .3s ease-out, top .3s ease-out;
	left: 0;
	top: 0;
	background: #333;
}

select {
	background-color: white;
	border-radius: 10px;
	font-size: 16px;
	border: 1px solid gray;
	box-shadow: 0 0 10px rgba(0,0,0,0.4);
	height: 35px;
	padding: 5px;
	font-family: bold;
	color: #747474;
}

input{
	-webkit-appearance: none;
	background: transparent;
	outline: none;
	border-top: 2px #333 solid;
	border-left: 2px #333 solid;
	border-bottom: 2px #777 solid;
	border-right: 2px #777 solid;
	font: unset;
	color: unset;
	width: 4rem;
	border-radius: 0;
}

input[type=file]::file-selector-button {
	padding: 4px;
	border-radius: 5px;
	background-color: white;
	border: 0px solid black;
	box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
}

input[type=range]::-moz-range-thumb {
	position: relative;
	-webkit-appearance: none;
	appearance: none;
	width: 25px;
	height: 25px;
	box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
	border: 1px solid darkgray;
	border-radius: 5px;
	background: white;
	cursor: pointer;
}

input[type=range]::-webkit-slider-thumb {
	position: relative;
	-webkit-appearance: none;
	appearance: none;
	width: 25px;
	height: 25px;
	box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
	border: 1px solid darkgray;
	border-radius: 5px;
	background: white;
	cursor: pointer;
}

@media (prefers-color-scheme: dark) {
	btn {
		background: #000;
		color: white;
	}
}
#maincontent{
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	right: 0;
	overflow: hidden;
	z-index: 1;
}
#posts{
	position: absolute;
	top: 90%;
	bottom: 0;
	left: 0;
	right: 0;
}

btn{
	display: block;
	height: 50px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	background: #fff;
}

.btn1{
	background: #fff;
	max-width: 70%;
	width: 300px;
	border: 2px #888 solid;
	box-shadow: 4px 4px black;
}
.btn1.active{
	transform: translate(2px, 2px);
	box-shadow: 2px 2px black;
}

#mainmenu bg{
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYBAMAAAASWSDLAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAPUExURf///wAAAEdwTHh4eAAAAERrJnIAAAAEdFJOU2ZmAGZFVb26AAAAJUlEQVQY02NwQQIMzgYMMMCCynEUUoICheHOEYQBYRNUDnJQAQACbSUPxnEdigAAAABJRU5ErkJggg'), url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAHlJREFUOE+tk10OgDAIg+GAntYDzkzDpkD5SeR1W+nXARONk8LiYx4PIvceW4HnQVRvMUdgPv2KoO73ze0g7+yhtBA8J0rAuojsKwQvNowlwn8jiIs6SpqBBtOZwG/MwlteO5NY+EY0wHgyyxk0lsnugvgqIsQ7oUUuLrY7MUeZYKEAAAAASUVORK5CYIIA');
	background-size: 6.25%, 100%;
	image-rendering: pixelated;
	background-position: 0% 0%, center;
	display: block;
	--w: max(100vw, 100vh);
	position: absolute;
	top: calc(50% - var(--w) / 2);
	left: calc(50% - var(--w) / 2);
	width: var(--w);
	height: var(--w);
	z-index: -1;
	transform: scale(1.2) rotate(-10deg);
}

#canvparent1{
	position: absolute;
	font-size: 0;
	z-index: 1;
	flex-shrink: 0;
	transform-origin: top left;
}
#canvparent2{
	position: absolute;
	font-size: 0;
	z-index: 3;
	width: 0;
	height: 0;
	flex-shrink: 0;
	transform-origin: top left;
	box-shadow: 0 0 0 0.07px #c6c4c4, 0 0 0 0.24px white, 0 0 0 0.35px #484848;
}
#canvas{
	image-rendering: optimizeSpeed;image-rendering: -moz-crisp-edges;image-rendering: -webkit-optimize-contrast;image-rendering:pixelated;image-rendering: -o-crisp-edges;image-rendering:optimize-contrast;-ms-interpolation-mode:nearest-neighbor;
	z-index: 0;
	position: absolute;
	background: #fff;
	outline: 1px white solid;
	z-index: 2;
	top: 50%;
	left: 50%;
}

#templateImage {
	pointer-events: none;
	position: absolute;
	transform-origin: top left;
	image-rendering: pixelated;
	will-change: transform;
	z-index: 2;
}

#canvselect{
	width: 100px;
	height: 100px;
	transform-origin: top left;
	position: absolute;
	will-change: transform;
	z-index: 3;
}
#edge{
	pointer-events: none;
	position: absolute;
	top: -114px;
	left: -144px;
	transform: scale(0.02) translate(-13px,9px) rotate(3.21deg);
	z-index: 1;
}
#posel{
	position: absolute;
	top: 20px;
	left: 50%;
	transform: translateX(-50%);
	width: 155px;
	height: 24px;
	padding: 5px;
	line-height: 17px;
	background: white;
	border-radius: 100px;
	text-align: center;
	z-index: 5;
	font-family: mono;
}

#place{
	position: absolute;
	bottom: 70px;
	left: 98%;
	transform: translateX(-50%);
	width: 30px;
	padding: 5px;
	background: white;
	border-radius: 100px;
	text-align: center;
	z-index: 5;
}
#modal {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: rgb(255, 255, 255);
	display: flex;
	flex-direction: column;
	color: rgb(0, 0, 0);
	border-radius: 8px;
	max-width: 325px;
	min-width: 325px;
	padding: 24px;
	z-index: 7;
	box-sizing: content-box;
}

@media (max-width:500px){
	#modal{
		padding: 16px;
		min-width: 200px;
		max-width: 275px;
	}

	#modal-install {
		width: 100%;
	}

	#modal-footer {
		margin-top: 16px;
	}
}

#close-btn{
	width: 20px;
  height: 20px;
  font-size: 20px;
  cursor: pointer;
	display: inline-block;
	fill: currentcolor;
	vertical-align: middle;
	line-height: 1em;
}
#modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
}

#modal-content{
	font-family: reddit;
	font-size: 18px;
	line-height: 20px;
	margin: 0px 0px 20px;
}

#modal-install {
	height: 40px;
	background: white;
	align-self: center;
	width: 60%;
	border: 1px solid lightgray;
	border-radius: 40px;
	text-align: center;
	line-height: 40px;
	cursor: pointer;
	transition: .1s border;
}

#modal-install:hover {
	border: 2px solid #ff4500;
	line-height: 38px;
}

#modal-footer {
	margin-top: 16px;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
}

#closebtn{
	right: unset;
	left: 20px;
	text-align: center;
	font-size: 25px;
	line-height: 8px;
}

#palette{
	display: block;
	transition: transform .3s ease-out;
	background: white;
	box-shadow: 0 0 10px black;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 7;
}

#colours {
	padding: 14px 14px 14px 14px;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
}

#palette .buttons{
	display: flex;
	flex-direction: row;
	justify-content: center;
	gap: 16px;
	padding: 16px 16px 16px 16px;
}

#ishide{
	position: absolute;
	bottom: 70px;
	left: 98%;
	transform: translateX(-50%);
	width: 30px;
	padding: 5px;
	background: white;
	border-radius: 100px;
	text-align: center;
	z-index: 5;
}
.pok{
	border: 4px #f1f1f1 solid;
	cursor: not-allowed;
	padding: 6px;
}
.pcancel svg, .pok svg{
	height: 100%;
}
.pok.enabled{
	border: 4px #ff5500 solid;
	cursor: pointer;
}

#colours div{
	height: 32px;
	flex-grow: 1;
	width: 24px;
	flex-shrink: 0;
	margin: 2px;
	cursor: pointer;
}

#colours div.sel{
	margin: 0;
	border: 2px white solid;
	box-shadow: rgb(0 0 0 / 50%) 0px 4px 10px;
	box-sizing: content-box;
}

/*Palette indicators*/
#colours span {
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 20px;
	width: 15px;
	height: 15px;
	position: absolute;
	text-align: center;
	line-height: 1;
	visibility: hidden;
}

@media (max-width: 1000px){
	#colours div{
		flex-basis: calc(100% / 16 - 4px);
	}
}
@media (max-width: 500px){
	#colours div{
		flex-basis: calc(100% / 8 - 4px);
	}
}
@media (max-width: 300px){
	#colours div{
		flex-basis: calc(100% / 4 - 4px);
	}
}

#helpbtn, #posel, #place, #archiveView, .toastMenu, #ishide,#captchaPopup, #closebtn, #timelapsePanel {
	box-shadow: 0 0 30px black;
}

#onlineCounter {
	display: inline-block;
	color: white;
	line-height: 16px;
}

#playerIcon {
	display: inline-block;
	color: white;
	height: 80%;
}

#donate {
	cursor: pointer;
	box-shadow: 0 0 10px grey;
	padding: 5px;
	line-height: 15px;
	background: white;
	text-align: center;
}

@keyframes pulse {
	0% {transform: scale(1);}
	50% {transform: scale(1.05);}
	100% { transform: scale(1);}
}

#onlinepanel {
	background: rgba(0, 0, 0, 0.6);
	height: 25px;
	border-radius: 10px;
	padding: 3px;
	margin-top: 2.5px;
	margin-right: 15px;
	display: flex;
	gap: 3px;
}

#connproblems {
	text-align:center;
	transition: opacity .5s;
	position: absolute;
	opacity: 0;
	bottom: 80px;
	z-index: 22;
	font-family: 'mono';
}

#chatPanel {
	position: absolute;
	top: 20px;
	width: 330px;
	bottom: 20px;
	right: 20px;
	border-radius: 10px;
	background-color: white;
	z-index: 99;
	padding: 10px;
	transform: translateX(calc(100% + 20px));
	transition: transform .2s;
}

#chatPanel.open{
	transform: translateX(0);
	box-shadow: 0 0 30px black;
}

#namePanel {
	z-index:1;
	position: absolute;
	bottom: 0;
	text-align: center;
	width: 100%;
	padding: 10px;
	background-color: white;
	border-radius: 15px;
	height: 120px;
	left: 0
}

.channels-options {
	position: relative;
	height:30px;
	width: 150px;
	border-radius: 20px;
	box-shadow: 0 0 10px rgba(0,0,0,0.4);
	display: flex;
	flex-direction: row;
	margin-right: 15px;
	cursor: pointer;
}

.channels-options > span {
	flex: auto; line-height: 30px; text-align: center; border-radius: 20px 0px 0px 20px; background-color: transparent;
}

#captchaPopup {
	z-index: 7;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translateY(-50%) translateX(-50%);
	height: fit-content;
	width: 450px;
	padding: 24px;
	border-radius: 8px;
	background-color: white;
}

/* Captcha buttons container on captcha popup */
#captchaPopup > div {
	display: grid;
	row-gap: 8px;
	column-gap: 8px;
	grid-template-columns: auto auto auto auto auto;
	width: 80%;
	margin-left: auto;
	margin-right: auto;
	margin-top: 32px;
}

/* We make it slightly more mobile usable by shrinking captcha buttons for really small phones */
#captchaPopup > div > input {
	width: auto;
	cursor: pointer;
	transition: transform cubic-bezier(0.215, 0.610, 0.355, 1) .1s;
}

#captchaPopup > div > input:hover {
	transform: scale(1.1);
}

@media screen and (max-width:700px) { /* TODO: Switch to more future proof orientation portrait */
	#captchaPopup {
		width: calc(100% - 16px);
		height: unset;
		padding: 16px;
	}

	#captchaPopup > div {
		row-gap: 4px;
		column-gap: 4px;
		width: 100%;
		margin-left: 0px;
		margin-right: 0px;
	}

	#chatPanel{
		left: 20px;
		width: unset;
	}
}


input {
	background-color: white;
	border-radius: 10px;
	font-size: 16px;
	border: none;
	box-shadow: 0 0 10px rgba(0,0,0,0.4);
	height: 35px;
	padding: 5px;
}

a {
	cursor: pointer;
}

#messageInput {
	position: absolute;
	bottom: 10px;
	width: calc(100% - 60px);
	flex: initial;
}

#messageTypePanel {
	padding: 5px;
	background: white;
	border: 1px solid lightgray;
	position: absolute;
	bottom: 0px;
	left: 0px;
	height: 100px;
	width: 100%;
	border-radius: 5px 5px 10px 10px;
}

.messageTypeBtn {
	width: calc(50% - 10px);
	margin-bottom: 5px;
	cursor: pointer;
	position: absolute;
	box-shadow: none;
	border: 1px solid lightgray;
}

.messageOptions {
	width: 35px;
	height: 35px;
	position: absolute;
	text-align: center;
	line-height: 35px;
	cursor: pointer;
	font-weight: bolder;
	border-radius: 10px;
	box-shadow: 0px 0px 5px gray;
}

#nameInput {
	position: absolute;
	width: calc(100% - 65px);
	left: 10px;
	display: inline-block;
	height: 40px;
}

#nameSubmit {
	position: absolute;
	display: inline-block;
	right: 10px;
	width: 40px;
	height: 40px;
	background: white;
	box-shadow: 0 3px 10px rgba(0,0,0,.3);
	border: none;
	border-radius: 10px;
	padding: 2px;
	transition: all .1s ease-in;
	cursor: pointer;
}

#nameSubmit:hover {
	transform: rotate(5deg) scale(110%);
}

.toastMenu {
	position: absolute;
	top: 60px;
	left: 50%;
	width: 380px;
	padding: 10px;
	line-height: 17px;
	background: white;
	border-radius: 15px;
	transition: all .2s ease-in;
	z-index: 5;
}

#serverInput {
	width: 100%;
}

.languageButton {
	font-size: xx-large;
	border: 0px solid black;
	background-color: transparent;
	transition: transform .2s;
	cursor: pointer;
}

.languageButton:hover {
	transform: scale(1.2);
}

#timelapsePanel {
	position: absolute;
	z-index: 20;
	padding: 10px;
	background: linear-gradient(white 0%, white 79%, gray 80%, #DAE0E6 80%);
	width: 360px;
	height: 540px;
	left: 50%;
	top: 50%;
	transform: translateY(-50%) translateX(-50%);
	border-radius: 4px;
	border: 2px solid gray;
}

.tooltip {
	cursor: pointer;
	width: 120px;
	background-color: white;
	text-align: center;
	border-radius: 10px;
	padding: 5px 0;
	position: absolute;
	z-index: 8;
	box-shadow: 0 0 10px rgba(0,0,0,0.4);
	top: 50px;
	left: 50%;
	transform: translateX(-50%);
	opacity: 1;
    transition: opacity .2s ease-out;
}

.tooltip::after {
	content: "";
	position: absolute;
	bottom: 100%;
	left: 50%;
	margin-left: -5px;
	border-width: 5px;
	border-style: solid;
	border-color: transparent transparent white transparent;
}

kbd {
	border-radius: 5px;
	padding: 2px 4px;
	border: 1px solid grey;
	font-size: 70%;
	font-weight: 700;
	box-shadow: 0 1px 1px rgba(0, 0, 0, .2), 0 2px 0 0 rgba(255, 255, 255, .7) inset;
}

.contextMenu {
	position: absolute;
	background: white;
	border-radius: 5px;
	box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
	transform: translateX(5px);
	padding: 5px;
	transition: transform .1s;
}
.contextMenu ul {
	padding: 0px;
	margin: 0px;
	min-width: 150px;
	list-style: none;
}
.contextMenu ul li {
	padding-bottom: 5px;
	padding-top: 5px;
	padding-left: 5px;
}
.contextMenu ul li a {
	text-decoration: none;
	color: black;

}
.contextMenu ul li:hover {
	background: lightgrey;
	border-radius: 5px;
}


@keyframes rainbow-text {
	0% {color: #e87d7d;}
	2% {color: #e88a7d;}
	4% {color: #e8977d;}
	6% {color: #e8a47d;}
	8% {color: #e8b07d;}
	10% {color: #e8bd7d;}
	12% {color: #e8ca7d;}
	14% {color: #e8d77d;}
	16% {color: #e8e47d;}
	18% {color: #dfe87d;}
	20% {color: #d3e87d;}
	22% {color: #c6e87d;}
	24% {color: #b9e87d;}
	26% {color: #ace87d;}
	28% {color: #9fe87d;}
	30% {color: #92e87d;}
	32% {color: #86e87d;}
	34% {color: #7de881;}
	36% {color: #7de88e;}
	38% {color: #7de89b;}
	40% {color: #7de8a8;}
	42% {color: #7de8b5;}
	44% {color: #7de8c1;}
	46% {color: #7de8ce;}
	48% {color: #7de8db;}
	50% {color: #7de8e8;}
	52% {color: #7ddbe8;}
	54% {color: #7dcee8;}
	56% {color: #7dc1e8;}
	58% {color: #7db5e8;}
	60% {color: #7da8e8;}
	62% {color: #7d9be8;}
	64% {color: #7d8ee8;}
	66% {color: #7d81e8;}
	68% {color: #867de8;}
	70% {color: #927de8;}
	72% {color: #9f7de8;}
	74% {color: #ac7de8;}
	76% {color: #b97de8;}
	78% {color: #c67de8;}
	80% {color: #d37de8;}
	82% {color: #df7de8;}
	84% {color: #e87de4;}
	86% {color: #e87dd7;}
	88% {color: #e87dca;}
	90% {color: #e87dbd;}
	92% {color: #e87db0;}
	94% {color: #e87da4;}
	96% {color: #e87d97;}
	98% {color: #e87d8a;}
	100% {color: #e87d7d;}
}
.rainbow-text {
	animation: rainbow-text 5s infinite;
}

#capchaImg {
	display: block;
	border: 1px solid grey;
	position: relative;
	width: 90px;
	height: 90px;
	left: 50%;
	transform: translateX(-50%);
	border-radius: 5px;
	image-rendering: pixelated;
}

#out #maincontent {
	height: 60%;
	transition: height .5s;

}
#out #more{
	position: absolute;
	left: 0;
	right: 0;
	height: 100%;
	display: block;
	z-index: 20;
	display: flex;
	align-items: stretch;
	flex-direction: column;
	visibility: visible;
}
#more {
	display: flex;
	visibility: hidden;
	overflow: auto;
	touch-action: pan-y;
}
#more *{touch-action: pan-y;}
#out #closebtn{ display: none }

#out #more #spaceFiller {
	display: block;
	height: 60vh;
	width: 100%;
	flex-shrink: 0;
}

#spaceFiller {
	height: 100vh;
	transition: height .5s;
}

#more #contents {
	background: #dae0e6;
	width: 100%;
	flex: 1;
	left: 0px;
	bottom: 0px;
	padding: 15px 30px 30px 30px;
	overflow: visible;
}
#more #contents > div{
	border: 1px #ccc solid;
	border-radius: 4px;
	background: #fff;
	margin: 0 auto;
	max-width: 640px;
	min-width: 250px;
	padding: 8px 16px;
	padding-left: 48px;
	margin-bottom: 15px;
	cursor: pointer;
	display: flex;
	gap: 10px;
	color: #aaa;
	position: relative;
	overflow: hidden;
}
up{
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	width: 40px;
	background: #f8f9fa;
}
up svg{
	fill: #888a8c;
	position: absolute;
	left: 8px;
	top: 5px;
	border-radius: 2px;
	padding: 3px;
}
up svg:hover{
	fill: #cc3700;
	background: #1a1a1b1a;
}

up div{
	position: absolute;
	left: 0; right: 0;
	top: 30px;
	text-align: center;
	color: #888a8c;
}
#more #contents > .post > div {
	flex: 1;
	margin: 3px 0;
}
#more #contents > .post > div > div { color: #000; }
#more #contents > .post > img {
	width: 40px;
	height: 40px;
}

#postInput {
	all: unset;
	background-color: #F6F7F8;
	border-radius: 4px;
	border: 1px solid #EDEFF1;
	box-shadow: none;
	box-sizing: border-box;
	color: #1c1c1c;
	display: block;
	flex-grow: 1;
	height: 38px;
	margin-right: 8px;
	outline: none;
	padding: 0 16px;
	margin-top: 4px;
	font-size: 16px;
	min-width: 5px;
}
#postInput:hover {
	background-color: #FFFFFF;
	border: 1px solid #0079D3;
}

.virtselect {
	max-width: 100% !important;
	margin-bottom: 5px;
}

.virtselect input {
	box-shadow: none !important;
	border-radius: 0px !important;
}



placechat {
	background: white;
	position: absolute;
	height: 4px;
	border-radius: 1.5px;
	font-size: 2px;
	padding: 0px 1px 0px 1px;
	text-align: center;
	left: 0px;
	top: 1px;
	z-index: 3;
	box-shadow: 0px 0px 1px black; /*TODO: Very laggy, make optionable */
	transform: translateX(-50%) translateY(-150%);
	line-height: 4px;
	max-width: 65px;
	width: max-content;
}

placechat::after {
	content: " ";
	position: absolute;
	top: 100%;
	left: 50%;
	margin-left: -2px;
	border-width: 2px;
	border-style: solid;
	border-color: white transparent transparent transparent;
}

placechat span {
	font-size: 2px;
	color: green;
}

postcopy {
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translateY(-50%);
	opacity: 0.7;
}

postcopy span {
	width: 132px;
	height: 24px;
	position: absolute;
	right: 48px;
	top: 50%;
	transform: translateY(-50%);
	line-height: 24px;
	transition: 1s opacity;
}
</style>