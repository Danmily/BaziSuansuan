import React, { useEffect, useRef } from 'react'

interface WheelColumnProps {
  items: number[]
  value: number
  onChange: (value: number) => void
  label: string
  scrollMultiplier?: number  // 拖动倍数
  formatNumber?: (num: number) => string  // 格式化函数
}

const WheelColumn = ({ 
  items, 
  value, 
  onChange, 
  label, 
  scrollMultiplier = 1.5,
  formatNumber = (num: number) => String(num).padStart(2, '0')
}: WheelColumnProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startScrollTop = useRef(0)
  const lastMouseY = useRef(0)
  const itemHeight = 50

  // 初始位置同步
  useEffect(() => {
    if (scrollRef.current && items.length > 0) {
      const index = items.indexOf(value)
      if (index >= 0) {
        scrollRef.current.scrollTop = index * itemHeight
      }
    }
  }, [value, items])

  // 核心：处理吸附对齐
  const handleSnap = () => {
    if (!scrollRef.current) return
    const scrollTop = scrollRef.current.scrollTop
    const index = Math.round(scrollTop / itemHeight)
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index))
    const targetValue = items[clampedIndex]
    
    scrollRef.current.scrollTo({
      top: clampedIndex * itemHeight,
      behavior: 'smooth'
    })
    
    // 更新值
    if (targetValue !== value) {
      onChange(targetValue)
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    e.preventDefault()
    e.stopPropagation()
    
    isDragging.current = true
    startY.current = e.clientY
    lastMouseY.current = e.clientY
    startScrollTop.current = scrollRef.current.scrollTop
    
    scrollRef.current.style.cursor = 'grabbing'
    scrollRef.current.style.userSelect = 'none'
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current || !scrollRef.current) return
      moveEvent.preventDefault()
      
      const delta = moveEvent.clientY - startY.current
      // 使用指定的倍数
      scrollRef.current.scrollTop = startScrollTop.current - delta * scrollMultiplier
      
      lastMouseY.current = moveEvent.clientY
    }

    const onMouseUp = (upEvent: MouseEvent) => {
      if (!scrollRef.current) return
      
      isDragging.current = false
      scrollRef.current.style.cursor = 'grab'
      scrollRef.current.style.userSelect = 'auto'
      
      // 计算拖动速度（用于惯性滚动）
      const velocity = upEvent.clientY - lastMouseY.current
      
      // 如果拖动速度足够快，添加轻微的惯性滚动
      if (Math.abs(velocity) > 5) {
        const inertiaMultiplier = 3
        const inertiaDistance = velocity * inertiaMultiplier
        const maxInertia = itemHeight * 3
        const limitedInertia = Math.max(-maxInertia, Math.min(maxInertia, inertiaDistance))
        
        const currentScrollTop = scrollRef.current.scrollTop
        const targetScrollTop = currentScrollTop - limitedInertia
        const targetIndex = Math.round(targetScrollTop / itemHeight)
        const clampedIndex = Math.max(0, Math.min(items.length - 1, targetIndex))
        const finalScrollTop = clampedIndex * itemHeight
        
        scrollRef.current.scrollTo({
          top: finalScrollTop,
          behavior: 'smooth'
        })
        
        setTimeout(() => {
          handleSnap()
        }, 300)
      } else {
        // 慢速拖动，直接吸附
        handleSnap()
      }
      
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: false })
    window.addEventListener('mouseup', onMouseUp)
  }

  // 处理滚动事件（用于滚轮滚动）
  const handleScroll = () => {
    if (!scrollRef.current || isDragging.current) return
    
    const scrollTop = scrollRef.current.scrollTop
    const index = Math.round(scrollTop / itemHeight)
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index))
    const targetValue = items[clampedIndex]
    
    if (targetValue !== value) {
      onChange(targetValue)
    }
  }

  // 滚动停止后的吸附
  useEffect(() => {
    if (!scrollRef.current || isDragging.current) return
    
    let timeoutId: ReturnType<typeof setTimeout>
    const handleScrollEnd = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (!isDragging.current) {
          handleSnap()
        }
      }, 150)
    }

    scrollRef.current.addEventListener('scroll', handleScrollEnd)
    return () => {
      scrollRef.current?.removeEventListener('scroll', handleScrollEnd)
      clearTimeout(timeoutId)
    }
  }, [items, value])

  return (
    <div className="flex-1 flex flex-col relative border-r border-gray-200 last:border-r-0">
      <div className="text-xs text-gray-500 py-2 text-center font-medium flex-shrink-0">{label}</div>
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto hide-scrollbar cursor-grab active:cursor-grabbing select-none"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          minHeight: 0,
          scrollBehavior: 'auto'
        }}
      >
        <div className="py-[150px]">
          {items.map((item) => (
            <div
              key={item}
              className={`h-[50px] flex items-center justify-center transition-all ${
                item === value 
                  ? 'text-orange-600 font-bold text-2xl' 
                  : 'text-gray-400 text-lg'
              }`}
            >
              {formatNumber(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WheelColumn
