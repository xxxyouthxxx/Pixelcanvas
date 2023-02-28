<template>
	<div class="canvas-container" ref="container" @mousedown="handleMouseDown" @mouseup="handleMouseUp" @mousemove="handleMouseMove" @wheel="handleWheel">
	  <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" style="background-color: white;"></canvas>
	</div>
  </template>
  
  <script>
  export default {
	data() {
	  return {
		canvasWidth: 600, // Canvas宽度
		canvasHeight: 400, // Canvas高度
		scale: 1, // Canvas缩放比例
		dragging: false, // 是否正在拖动
		lastX: 0, // 上一个点的X坐标
		lastY: 0 // 上一个点的Y坐标
	  };
	},
	mounted() {
	  // 获取Canvas和Canvas容器
	  const canvas = this.$refs.canvas;
	  const container = this.$refs.container;
  
	  // 设置初始Canvas位置
	  canvas.style.transform = `translate(${container.offsetWidth / 2 - this.canvasWidth / 2}px, ${container.offsetHeight / 2 - this.canvasHeight / 2}px)`;
  
	  // 监听窗口大小变化
	  window.addEventListener('resize', () => {
		canvas.style.transform = `translate(${container.offsetWidth / 2 - this.canvasWidth / 2}px, ${container.offsetHeight / 2 - this.canvasHeight / 2}px)`;
	  });
	},
	methods: {
	  handleMouseDown(event) {
		// 鼠标按下开始拖动
		this.dragging = true;
		this.lastX = event.clientX;
		this.lastY = event.clientY;
	  },
	  handleMouseUp() {
		// 鼠标松开停止拖动
		this.dragging = false;
	  },
	  handleMouseMove(event) {
		if (this.dragging) {
		  // 计算鼠标移动距离
		  const deltaX = event.clientX - this.lastX;
		  const deltaY = event.clientY - this.lastY;
  
		  // 更新Canvas位置
		  const canvas = this.$refs.canvas;
		  const transform = window.getComputedStyle(canvas).getPropertyValue('transform');
		  const matrix = new DOMMatrix(transform);
		  canvas.style.transform = `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.e + deltaX}, ${matrix.f + deltaY})`;
  
		  // 保存当前鼠标位置
		  this.lastX = event.clientX;
		  this.lastY = event.clientY;
		}
	  },
	  handleWheel(event) {
		// 阻止页面滚动
		event.preventDefault();
  
		// 计算缩放比例
		const delta = Math.sign(event.deltaY);
		const scaleDelta = delta * 0.1;
		this.scale = Math.max(0.1, Math.min(10, this.scale + scaleDelta));
  
		// 更新Canvas缩放
		const canvas = this.$refs.canvas;
		canvas.style.transform = `scale(${this.scale})`;
	  }
	}
  };
  </script>
  
  <style scoped>
  .canvas-container {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	background-color: #333;
	overflow: hidden;
	user-select: none;
  }
  canvas {
	border: 1px solid black;
  }
  </style>
  