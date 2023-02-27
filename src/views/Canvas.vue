<template>
    <div id="drawing" ref="drawingElement" :style="{ transform: `translate(${x}px, ${y}px)` }">
      <canvas id="image" ref="imageCanvasElement" width="2000" height="2000" :style="{ '--image-scale': scale }">
        Canvas disabled
      </canvas>
      <div id="cursor" ref="cursorElement" :style="{ 
        '--cursor-x-offset': xOffset,
        '--cursor-y-offset': yOffset,
        transform: `scale(${cursorScale}) translate(calc(3.2vh * var(--cursor-x-offset)), calc(3.2vh * var(--cursor-y-offset)))`
      }">
      </div>
    </div>
    <div id="position" ref="positionElement">
      ({{ x }},{{ y }})
    </div>
    <div id="timer" ref="timerElement" class="place-mode">
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 50 50" style="fill:#1c1b1a">
        <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 24.984375 6.9863281 A 1.0001 1.0001 0 0 0 24 8 L 24 22.173828 A 3 3 0 0 0 22 25 A 3 3 0 0 0 22.294922 26.291016 L 16.292969 32.292969 A 1.0001 1.0001 0 1 0 17.707031 33.707031 L 23.708984 27.705078 A 3 3 0 0 0 25 28 A 3 3 0 0 0 28 25 A 3 3 0 0 0 26 22.175781 L 26 8 A 1.0001 1.0001 0 0 0 24.984375 6.9863281 z">
        </path>
      </svg>
      <div id="time" ref="timeElement">
        {{ time }}
      </div>
      <div id="place-mode">
        Place a tile
      </div>
    </div>
    <div id="zoom">
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 30 30" style="fill:#1c1b1a">
        <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z">
        </path>
      </svg>
      <div id="zoom-level" ref="zoomLevelElement">
        {{ zoom }}
      </div>
    </div>
    <div id="place-bar" ref="placeBarElement">
      <div id="colors">
        <div v-for="(color, index) in colors" :key="index" :id="color" class="color" :class="{ focus: activeColor === color }">
        </div>
      </div>
      <div id="place-button-container">
        <div id="cancel-place" ref="cancelPlaceElement">
        </div>
        <div id="valid-place" ref="validPlaceElement">
        </div>
      </div>
    </div>
</template>
<script>
  export default {
    data() {
      return {
        x: -297.92,
        y: -83.8648,
        scale: 0.266237,
        xOffset: 1118,
        yOffset: 314,
        cursorScale: 0.0125,
        time: '-1:-4:00',
        zoom: '1x',
        colors: [
          'burgandy', 'dark-red', 'red', 'orange', 'yellow', 'pale-yellow', 
          'dark-green', 'green', 'light-green', 'dark-teal', 'teal', 'light-teal',
          'dark-blue', 'blue', 'light-blue', 'indigo', 'periwinkle', 'lavender',
          'dark-purple', 'purple', 'pale-purple', 'magenta', 'pink', 'light-pink',
          'dark-brown', 'brown', 'beige', 'black', 'dark-gray', 'gray', 'light-gray', 'white'
        ],
        activeColor: 'white',
        jscomp:{},
        
      }
    },
    created: function() {
      this.jscomp = {
        scope:{},
        createTemplateTagFirstArg: function(a) {
          return a.raw = a
        },
        createTemplateTagFirstArgWithRaw: function(a, b) {
          a.raw = b;
          return a
        },
        arrayIteratorImpl: function(a) {
          var b = 0;
          return function() {
            return b < a.length ? { done: !1, value: a[b++] } : { done: !0 }
          }
        },
        arrayIterator: function(a) {
          return { next: this.arrayIteratorImpl(a) }
        },
        makeIterator: function(a) {
          var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
          return b ? b.call(a) : this.arrayIterator(a)
        },
      }
    }
  }
  </script>
<style>
@import url(https://fonts.googleapis.com/css2?family=Roboto&display=swap);
	:root {
	--color1:#fff;
	--color2:#1c1b1a;
	--color3:#c7c1bb;
	--cursor-x-offset:1000;
	--cursor-y-offset:1000;
	--image-scale:0
}
* {
	position:relative;
	z-index:0;
	margin:0;
	padding:0;
	font-family:Roboto,sans-serif
}
html {
	height:100%;
	overflow:hidden
}
body {
	height:100%;
	background-color:var(--color2);
	overflow:hidden
}
#position {
	position:fixed;
	top:2vh;
	left:50%;
	padding:0
			3vh;
	height:3vh;
	background-color:var(--color1);
	border-radius:1.5vh;
	line-height:3vh;
	font-size:1.75vh;
	color:var(--color2);
	box-shadow:.1vh
			.1vh .4vh -.2vh var(--color2);
	transform:translateX(-50%)
}
#drawing {
	position:absolute;
	top:50%;
	left:50%;
	height:80vh;
	width:80vh;
	transform:translate(-50%,-50%)
}
#image {
	position:absolute;
	image-rendering:pixelated;
	background-image:url(../assets/current.png);
	background-size:contain;
	transform-origin:top
			left;
	transform:scale(var(--image-scale))
}
#cursor {
	position:absolute;
	top:0;
	left:0;
	height:3.2vh;
	width:3.2vh;
	transform-origin:top
			left;
	transform:scale(.0125) translate(calc(3.2vh * var(--cursor-x-offset)),calc(3.2vh
			* var(--cursor-y-offset)))
}
#cursor::after,#cursor::before {
	display:block;
	position:absolute;
	top:50%;
	left:50%;
	height:5.333vh;
	width:5.333vh;
	content:"";
	background-color:#9c9894;
	transform:translate(-50%,-50%)
}
#cursor::before {
	clip-path:polygon(0
			0,40% 0,40% 20%,20% 20%,20% 40%,0 40%,0 60%,20% 60%,20% 80%,40% 80%,40%
			100%,60% 100%,60% 80%,80% 80%,80% 60%,100% 60%,100% 40%,80% 40%,80% 20%,60%
			20%,60% 0,100% 0,100% 100%,0 100%)
}
#cursor::after {
	height:4.266vh;
	width:4.266vh;
	background-color:#5c5956;
	clip-path:polygon(0
			0,37.5% 0,37.5% 12.5%,12.5% 12.5%,12.5% 37.5%,0 37.5%,0 62.5%,12.5% 62.5%,12.5%
			87.5%,37.5% 87.5%,37.5% 100%,62.5% 100%,62.5% 87.5%,87.5% 87.5%,87.5% 62.5%,100%
			62.5%,100% 37.5%,87.5% 37.5%,87.5% 12.5%,62.5% 12.5%,62.5% 0,100% 0,100%
			100%,0 100%)
}
#timer,#zoom {
	position:fixed;
	left:50%;
	bottom:2vh;
	height:3vh;
	width:11vh;
	padding:0
			3vh;
	background-color:var(--color1);
	border-radius:1.5vh;
	box-shadow:.1vh
			.1vh .4vh -.2vh var(--color2);
	transform:translateX(-50%)
}
#zoom {
	position:fixed;
	left:auto;
	right:2vh;
	width:7vh;
	padding:0
}
#timer
			svg,#zoom svg {
	margin:.25vh;
	height:2.5vh;
	width:2.5vh
}
#time,#zoom-level {
	float:right;
	line-height:3vh;
	font-size:1.75vh;
	color:var(--color2)
}
#zoom-level {
	right:1vh
}
#place-mode {
	display:none;
	line-height:3vh;
	font-size:1.75vh
}
#timer.place-mode {
	width:auto
}
#timer.place-mode:not(#place-mode) {
	display:none
}
#timer.place-mode #place-mode {
	display:block
}
#place-bar {
	position:fixed;
	bottom:0;
	width:100vw;
	padding:1vh
			0;
	background-color:var(--color1);
	box-shadow:.1vh .1vh .4vh -.2vh var(--color2);
	transform:translateY(100%);
	transition:.2s
			transform ease-in-out
}
#place-bar.focus {
	transform:translateY(0)
}
#colors {
	display:flex;
	justify-content:center;
	flex-wrap:wrap;
	margin-top:1vh;
	left:50%;
	width:98vw;
	transform:translateX(-50%)
}
#colors
			.color {
	margin:.15vh;
	height:3vh;
	width:5vh;
	border-radius:.3vh;
	border:solid
			.15vh var(--color3);
	transition:.2s border-color ease-in-out,.2s box-shadow
			ease-in-out
}
#colors .color.focus,#colors .color:hover {
	border-color:var(--color1);
	box-shadow:0
			0 0 .15vh var(--color2)
}
#burgandy {
	background-color:#6d001a
}
#dark-red {
	background-color:#be0039
}
#red {
	background-color:#ff4500
}
#orange {
	background-color:#ffa800
}
#yellow {
	background-color:#ffd635
}
#pale-yellow {
	background-color:#fff8b8
}
#dark-green {
	background-color:#00a368
}
#green {
	background-color:#00cc78
}
#light-green {
	background-color:#7eed56
}
#dark-teal {
	background-color:#00756f
}
#teal {
	background-color:#009eaa
}
#light-teal {
	background-color:#00ccc0
}
#dark-blue {
	background-color:#2450a4
}
#blue {
	background-color:#3690ea
}
#light-blue {
	background-color:#51e9f4
}
#indigo {
	background-color:#493ac1
}
#periwinkle {
	background-color:#6a5cff
}
#lavender {
	background-color:#94b3ff
}
#dark-purple {
	background-color:#811e9f
}
#purple {
	background-color:#b44ac0
}
#pale-purple {
	background-color:#e4abff
}
#magenta {
	background-color:#de107f
}
#pink {
	background-color:#ff3881
}
#light-pink {
	background-color:#f9a
}
#dark-brown {
	background-color:#6d482f
}
#brown {
	background-color:#9c6926
}
#beige {
	background-color:#ffb470
}
#black {
	background-color:#000
}
#dark-gray {
	background-color:#515252
}
#gray {
	background-color:#898d90
}
#light-gray {
	background-color:#d4d7d9
}
#white {
	background-color:#fff
}
#place-button-container {
	display:flex;
	justify-content:space-evenly;
	flex-wrap:wrap;
	margin-top:2vh;
	left:50%;
	width:80vw;
	min-width:25.2vh;
	transform:translateX(-50%)
}
#cancel-place,#valid-place {
	display:inline-block;
	margin:.5vh;
	height:3vh;
	width:25vh;
	border:solid
			.1vh var(--color3);
	border-radius:1.5vh;
	flex-shrink:0;
	transition:.2s border-color
			ease-in-out
}
#cancel-place:hover,#valid-place:hover {
	border:solid .1vh var(--color2)
}
#cancel-place::after,#cancel-place::before,#valid-place::after,#valid-place::before {
	display:block;
	position:absolute;
	top:50%;
	left:50%;
	height:.2vh;
	width:2vh;
	content:"";
	background-color:var(--color2)
}
#cancel-place::before {
	transform:translate(-50%,-50%)
			rotate(45deg)
}
#cancel-place::after {
	transform:translate(-50%,-50%) rotate(-45deg)
}
#valid-place::before {
	top:50%;
	width:1vh;
	transform:translate(-85%,200%)
			rotate(45deg)
}
#valid-place::after {
	transform:translate(-15%,-50%) rotate(-45deg)
}

</style>