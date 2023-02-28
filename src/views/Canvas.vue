<template>
	<div>
	  <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" @click="handleClick"></canvas>
	</div>
  </template>
  
  <script>
  export default {
	data() {
	  return {
		canvasWidth: 1000,
		canvasHeight: 1000,
		pixels: Array.from({ length: 50 }, () => Array.from({ length: 50 }, () => ({ color: '#ffffff' })))
	  }
	},
	mounted() {
	  const canvas = this.$refs.canvas
	  const ctx = canvas.getContext('2d')
	  this.renderCanvas(ctx)
	},
	methods: {
	  renderCanvas(ctx) {
		const pixelSize = 20
		for (let i = 0; i < this.pixels.length; i++) {
		  for (let j = 0; j < this.pixels[i].length; j++) {
			const { color } = this.pixels[i][j]
			ctx.fillStyle = color
			ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize)
		  }
		}
		console.log(this.pixels);
	  },
	  handleClick(e) {
		const canvas = this.$refs.canvas
		const pixelSize = 20
		const rect = canvas.getBoundingClientRect()
		const x = Math.floor((e.clientX - rect.left) / pixelSize)
		const y = Math.floor((e.clientY - rect.top) / pixelSize)
		const color = '#000000' // 用户选择的颜色，可以通过其他方式获取
		this.pixels[x][y].color = color
	  }
	},
	watch: {
	  pixels: {
		handler() {
		  const canvas = this.$refs.canvas
		  const ctx = canvas.getContext('2d')
		  this.renderCanvas(ctx)
		},
		deep: true
	  }
	}
  }
  </script>
  