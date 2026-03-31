import { Item } from "./receipt-input";

type Props = {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    setCalculatedTotalPrice: React.Dispatch<React.SetStateAction<number>>;
};

export function ItemsTable({ items, setItems, setCalculatedTotalPrice }: Props) {

    const handleRemoveItem = (index: number) => {
        setItems(prevItems => {
            const newItems = prevItems.filter((_item, i) => i !== index);
            setCalculatedTotalPrice(newItems.reduce((sum, it) => sum + it.amount, 0));
            return newItems;
        });
    }

    return (
        <table className="w-full text-xs table-fixed">
            <thead className="w-full">
                <tr className="bg-gray-300 h-8">
                    <th className="w-1/5">カテゴリ</th>
                    <th className="w-2/5">項目名</th>
                    <th className="w-1/5">金額</th>
                    <th className="w-1/5">削除</th>
                </tr>
            </thead>
            <tbody className="w-full">
                {items.map((item: Item, index: number) => {
                    return (
                        <tr key={index} className="border-b border-gray-300 h-12">
                            <td className="text-start w-1/5">
                                <select
                                    value={item.category}
                                    onChange={(e) => {
                                        const newItems: Array<Item> | [] = [...items];
                                        newItems[index].category = e.target.value;
                                        setItems(newItems);
                                    }}
                                    className="h-10 mx-1 rounded border-gray-300"
                                >
                                    <option value="food">🔴食費</option>
                                    <option value="restaurant">🔴外食</option>
                                    <option value="goods">🟢日用品</option>
                                    <option value="child goods">🟢子育て</option>
                                    <option value="other">⚪その他</option>
                                </select>
                            </td>
                            <td className="w-2/5 px-1">
                                <input
                                    className="h-10 w-full"
                                    value={item.name}
                                    onChange={(e) => {
                                        const newItems: Array<Item> | [] = [...items];
                                        newItems[index].name = e.target.value;
                                        setItems(newItems);
                                    }}
                                />
                            </td>
                            <td className="w-1/5 px-1">
                                <input
                                    className="h-10 w-full"
                                    value={item.amount}
                                    onChange={(e) => {
                                        const newItems: Array<Item> | [] = [...items];
                                        newItems[index].amount = Number(e.target.value);
                                        setItems(newItems);
                                        setCalculatedTotalPrice(
                                            items.reduce(
                                                (
                                                    sum: number,
                                                    item: { name: string, amount: number }
                                                ) => sum + item.amount, 0));
                                        console.log(items)
                                    }}
                                />
                            </td>
                            <td>
                                <button className="w-1/5" onClick={() => handleRemoveItem(index)}>trash</button>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}