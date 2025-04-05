<template>
    <div class="slider-wrapper">
      <button class="nav-button left" @click="scrollLeft">
      </button>
      
      <div class="scroll-container" ref="scrollContainerRef" @scroll="handleScroll">
        <div class="clone-container start-clone" ref="startCloneRef">
          <slot name="clone-end"></slot>
        </div>
        
        <div class="original-container" ref="originalContainerRef">
          <slot></slot>
        </div>
        
        <div class="clone-container end-clone" ref="endCloneRef">
          <slot name="clone-start"></slot>
        </div>
      </div>
      
      <button class="nav-button right" @click="scrollRight">
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  
  const scrollContainerRef = ref(null)
  const originalContainerRef = ref(null)
  const startCloneRef = ref(null)
  const endCloneRef = ref(null)
  
  const scrollOffset = 300
  
  const isScrolling = ref(false)
  
  function scrollLeft() {
    if (scrollContainerRef.value) {
      isScrolling.value = true
      scrollContainerRef.value.scrollBy({
        left: -scrollOffset,
        behavior: 'smooth'
      })
      
      setTimeout(() => {
        isScrolling.value = false
      }, 500)
    }
  }

  function scrollRight() {
    if (scrollContainerRef.value) {
      isScrolling.value = true
      scrollContainerRef.value.scrollBy({
        left: scrollOffset,
        behavior: 'smooth'
      })
      
      setTimeout(() => {
        isScrolling.value = false
      }, 500)
    }
  }
  
  function setupInfiniteScroll() {
    if (!originalContainerRef.value || !startCloneRef.value || !endCloneRef.value) return
    
    const originalItems = originalContainerRef.value.children
    
    if (originalItems.length === 0) return
    
    startCloneRef.value.innerHTML = ''
    endCloneRef.value.innerHTML = ''
    
    const containerWidth = scrollContainerRef.value.clientWidth
    const itemWidth = originalItems[0].offsetWidth
    const itemsToClone = Math.min(Math.ceil(containerWidth / itemWidth) + 2, originalItems.length)
    
    for (let i = originalItems.length - itemsToClone; i < originalItems.length; i++) {
      const clone = originalItems[i].cloneNode(true)
      startCloneRef.value.appendChild(clone)
    }
    
    for (let i = 0; i < itemsToClone; i++) {
      const clone = originalItems[i].cloneNode(true)
      endCloneRef.value.appendChild(clone)
    }
    
    scrollToOriginalStart()
  }
  
  function scrollToOriginalStart() {
    if (!scrollContainerRef.value || !startCloneRef.value) return
    
    scrollContainerRef.value.style.scrollBehavior = 'auto'
    
    scrollContainerRef.value.scrollLeft = startCloneRef.value.offsetWidth
    
    setTimeout(() => {
      if (scrollContainerRef.value) {
        scrollContainerRef.value.style.scrollBehavior = 'smooth'
      }
    }, 50)
  }
  
  function handleScroll() {
    if (!scrollContainerRef.value || isScrolling.value) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.value
    const startCloneWidth = startCloneRef.value?.offsetWidth || 0
    const endThreshold = scrollWidth - clientWidth - 20 // 20px buffer
    
    if (scrollLeft < startCloneWidth / 2) {
      isScrolling.value = true
      const jumpPosition = scrollWidth - clientWidth - endCloneRef.value.offsetWidth
      scrollContainerRef.value.style.scrollBehavior = 'auto'
      scrollContainerRef.value.scrollLeft = jumpPosition
      
      setTimeout(() => {
        if (scrollContainerRef.value) {
          scrollContainerRef.value.style.scrollBehavior = 'smooth'
          isScrolling.value = false
        }
      }, 50)
    }
    else if (scrollLeft > endThreshold) {
      isScrolling.value = true
      scrollContainerRef.value.style.scrollBehavior = 'auto'
      scrollContainerRef.value.scrollLeft = startCloneWidth
      
      setTimeout(() => {
        if (scrollContainerRef.value) {
          scrollContainerRef.value.style.scrollBehavior = 'smooth'
          isScrolling.value = false
        }
      }, 50)
    }
  }
  
  let resizeDebounceTimer
  function handleResize() {
    clearTimeout(resizeDebounceTimer)
    resizeDebounceTimer = setTimeout(() => {
      setupInfiniteScroll()
    }, 250)
  }
  
  onMounted(() => {
    nextTick(() => {
      setupInfiniteScroll()
    })
    
    window.addEventListener('resize', handleResize)
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    clearTimeout(resizeDebounceTimer)
  })
  </script>
  
  <style>
  @import '../styles/components/HorizontalPagination.css'
  </style>