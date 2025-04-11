<template>
  <div class="slider-wrapper">
    <button class="nav-button left" @click="scrollLeft" aria-label="Scroll left">
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

    <button class="nav-button right" @click="scrollRight" aria-label="Scroll right">
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

const emit = defineEmits(['update:cloneStart', 'update:cloneEnd'])

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
  if (!originalContainerRef.value || !startCloneRef.value || !endCloneRef.value || !scrollContainerRef.value) return
  
  nextTick(() => {
    const originalItems = originalContainerRef.value.children
    if (originalItems.length === 0) return

    const containerWidth = scrollContainerRef.value.clientWidth
    const itemWidth = originalItems[0].offsetWidth + parseInt(getComputedStyle(originalItems[0]).marginRight)
    const itemsToClone = Math.min(Math.ceil(containerWidth / itemWidth) + 2, originalItems.length)

    emit('update:cloneStart', {
      start: 0,
      end: itemsToClone
    })
    
    emit('update:cloneEnd', {
      start: Math.max(0, originalItems.length - itemsToClone),
      end: originalItems.length
    })

    // Initial positioning after clones are created
    nextTick(() => {
      scrollToOriginalStart()
    })
  })
}

function scrollToOriginalStart() {
  if (!scrollContainerRef.value || !startCloneRef.value) return

  scrollContainerRef.value.style.scrollBehavior = 'auto'
  scrollContainerRef.value.scrollLeft = startCloneRef.value.offsetWidth

  setTimeout(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.style.scrollBehavior = 'smooth'
    }
  }, 100)
}

function handleScroll() {
  if (!scrollContainerRef.value || !startCloneRef.value || !endCloneRef.value || isScrolling.value) return

  const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.value
  const startCloneWidth = startCloneRef.value.offsetWidth
  const endCloneWidth = endCloneRef.value.offsetWidth
  
  const startThreshold = 50
  const endThreshold = scrollWidth - clientWidth - 50

  if (scrollLeft <= startThreshold) {
    isScrolling.value = true
    const jumpPosition = scrollWidth - clientWidth - endCloneWidth - 20
    
    scrollContainerRef.value.style.scrollBehavior = 'auto'
    scrollContainerRef.value.scrollLeft = jumpPosition
    
    setTimeout(() => {
      if (scrollContainerRef.value) {
        scrollContainerRef.value.style.scrollBehavior = 'smooth'
        isScrolling.value = false
      }
    }, 50)
  } 
  else if (scrollLeft >= endThreshold) {
    isScrolling.value = true
    
    scrollContainerRef.value.style.scrollBehavior = 'auto'
    scrollContainerRef.value.scrollLeft = startCloneWidth + 20
    
    setTimeout(() => {
      if (scrollContainerRef.value) {
        scrollContainerRef.value.style.scrollBehavior = 'smooth'
        isScrolling.value = false
      }
    }, 50)
  }
}

let resizeObserver = null
let resizeDebounceTimer = null

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

  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(handleResize)
    if (scrollContainerRef.value) {
      resizeObserver.observe(scrollContainerRef.value)
    }
  } else {
    window.addEventListener('resize', handleResize)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  } else {
    window.removeEventListener('resize', handleResize)
  }
  clearTimeout(resizeDebounceTimer)
})
</script>

<style>
@import '../styles/components/HorizontalPagination.css';
</style>