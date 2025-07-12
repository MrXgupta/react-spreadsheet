import {createRef, useEffect, useRef, useState} from "react";

const Grid = () => {
    const numRows = 100;
    const numCols = 26;

    const [inputs, setInputs] = useState(
        Array.from({ length: numRows }, () =>
            Array.from({ length: numCols }, () => "")
        )
    );

    const [focusedCell, setFocusedCell] = useState({
        rowIndex: 0,
        colIndex: 0,
    });

    const containerRef = useRef(null);
    const refs = useRef(
        Array.from({ length: numRows }, () =>
            Array.from({ length: numCols }, () => createRef())
        )
    );

    const handleChange = (row, col, value) => {
        setInputs(prev => {
            const next = [...prev];
            next[row] = [...next[row]];
            next[row][col] = value;
            localStorage.setItem("spreadsheetInputs", JSON.stringify(next));
            return next;
        });
    };

    useEffect(() => {
        const storedInputs = localStorage.getItem("spreadsheetInputs");
        if (storedInputs) {
            setInputs(JSON.parse(storedInputs));
        }
    }, []);

    const handleKeyDown = (e, row, col) => {
        let newRow = row;
        let newCol = col;

        if (e.key === "ArrowUp") {
            e.preventDefault();
            newRow = Math.max(0, row - 1);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            newRow = Math.min(numRows - 1, row + 1);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            newCol = Math.max(0, col - 1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            newCol = Math.min(numCols - 1, col + 1);
        } else if (e.key === "Tab") {
            e.preventDefault();
            if (e.shiftKey) {
                if (col > 0) {
                    newCol = col - 1;
                } else if (row > 0) {
                    newRow = row - 1;
                    newCol = numCols - 1;
                }
            } else {
                if (col < numCols - 1) {
                    newCol = col + 1;
                } else if (row < numRows - 1) {
                    newRow = row + 1;
                    newCol = 0;
                }
            }
        }

        setFocusedCell({ rowIndex: newRow, colIndex: newCol });
    };

    useEffect(() => {
        if (
            focusedCell.rowIndex != null &&
            focusedCell.colIndex != null
        ) {
            const ref = refs.current[focusedCell.rowIndex][focusedCell.colIndex];
            ref.current?.focus();
            ref.current?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest"
            });
        }
    }, [focusedCell]);

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-auto" ref={containerRef}>
                <table className="border-collapse min-w-full">
                    <thead>
                    <tr>
                        <th className="sticky top-0 left-0 bg-slate-800 text-slate-100 border border-slate-600"></th>
                        {Array.from({ length: numCols }, (_, i) => (
                            <th
                                key={i}
                                className="sticky top-0 bg-slate-800 text-slate-100 border border-slate-600 px-2"
                            >
                                {String.fromCharCode(65 + i)}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {Array.from({ length: numRows }, (_, rowIdx) => (
                        <tr key={rowIdx}>
                            <th
                                className="sticky left-0 bg-slate-800 text-slate-100 border border-slate-600 px-2"
                            >
                                {rowIdx + 1}
                            </th>
                            {Array.from({ length: numCols }, (_, colIdx) => (
                                <td
                                    key={colIdx}
                                    className={`border border-slate-600 ${
                                        focusedCell.rowIndex === rowIdx &&
                                        focusedCell.colIndex === colIdx
                                            ? "ring-2 ring-cyan-400"
                                            : ""
                                    }`}
                                >
                                    <input
                                        ref={refs.current[rowIdx][colIdx]}
                                        type="text"
                                        value={inputs[rowIdx][colIdx]}
                                        onChange={(e) =>
                                            handleChange(rowIdx, colIdx, e.target.value)
                                        }
                                        onFocus={() =>
                                            setFocusedCell({ rowIndex: rowIdx, colIndex: colIdx })
                                        }
                                        onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                                        className="w-full bg-slate-900 text-slate-100 p-1 outline-none"
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <footer className="h-12 bg-slate-800 text-slate-100 flex items-center justify-center text-sm">
                {focusedCell.rowIndex !== null && focusedCell.colIndex !== null ? (
                    <>
                        Cell:{" "}
                        <span className="font-semibold mx-1">
              {String.fromCharCode(65 + focusedCell.colIndex)}
                            {focusedCell.rowIndex + 1}
            </span>
                        Value:{" "}
                        <span className="mx-1">
              {inputs[focusedCell.rowIndex][focusedCell.colIndex]}
            </span>
                        | Total cells: {numRows * numCols}
                    </>
                ) : (
                    "No cell selected"
                )}
            </footer>
        </div>
    );
};

export default Grid;