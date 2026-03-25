type Stock = {
    id: string
    vehicle_name: string
    class: string
    current_stock: number
    max_stock: number
}

type StockRowProps = {
    stock: Stock
}

function StockRow({stock}: StockRowProps) {
    const isSoldOut = stock.current_stock >= stock.max_stock && stock.max_stock !== 0;

    return (
        <tr
            className={`transition duration-150 backdrop-blur-sm ${
                isSoldOut
                    ? 'bg-red-950 hover:bg-red-900/50'
                    : 'bg-zinc-800/60 hover:bg-zinc-800/50'
            }`}
        >
            <td className="px-2 py-2 md:px-6 md:py-4 text-sm text-zinc-200">{stock.vehicle_name}</td>
            <td className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold uppercase text-zinc-300">
                {stock.class}
            </td>
            <td className="px-2 py-2 md:px-6 md:py-4 text-sm">
                {stock.current_stock}
            </td>
            <td className="px-2 py-2 md:px-6 md:py-4 text-sm font-semibold text-zinc-300">
                {stock.max_stock === 0 ? '∞' : stock.max_stock}
            </td>
        </tr>
    )
}

export default StockRow
