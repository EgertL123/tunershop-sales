import {useState} from 'react'

export function usePagination(items: any[], itemsPerPage: number) {
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(items.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = items.slice(startIndex, endIndex)

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const resetPage = () => {
        setCurrentPage(1)
    }

    return {
        currentPage,
        totalPages,
        currentItems,
        handlePrevious,
        handleNext,
        resetPage,
    }
}
