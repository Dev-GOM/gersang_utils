import { useState, useMemo } from 'react'
import './App.css'

let idCounter = 0

function formatGold(eokValue) {
  const totalMan = Math.round(eokValue * 10000)
  const eok = Math.floor(totalMan / 10000)
  const man = totalMan % 10000

  let str = ''
  if (eok > 0) str += `${eok}억 `
  if (man > 0) str += `${man}만 `
  if (str === '') return '0냥'
  return str + '냥'
}

function App() {
  const [records, setRecords] = useState([])

  // 입력 상태
  const [name1, setName1] = useState('')
  const [qty1, setQty1] = useState(1)
  const [gold1, setGold1] = useState('')
  const [ratio1, setRatio1] = useState('')

  const [name2, setName2] = useState('')
  const [qty2, setQty2] = useState(1)
  const [cash2, setCash2] = useState('')
  const [ratio2, setRatio2] = useState('')

  const totals = useMemo(() => {
    return records.reduce(
      (acc, item) => {
        acc.cash += item.cashValue
        acc.gold += item.goldValue
        return acc
      },
      { cash: 0, gold: 0 }
    )
  }, [records])

  function addCashItem() {
    let qty = parseInt(qty1, 10) || 1
    if (qty < 1) qty = 1

    const unitGold = parseFloat(gold1)
    const ratio = parseFloat(ratio1)

    if (!unitGold || !ratio) {
      alert('게임머니 가격과 시세 비율을 정확히 입력해주세요.')
      return
    }

    const unitCash = (unitGold / ratio) * 10000

    setRecords((prev) => [
      ...prev,
      {
        id: idCounter++,
        type: '머니 기준',
        name: name1.trim() || '이름 없음',
        ratio,
        unitCash,
        unitGold,
        qty,
        cashValue: unitCash * qty,
        goldValue: unitGold * qty,
      },
    ])

    setName1('')
    setQty1(1)
    setGold1('')
  }

  function addGoldItem() {
    let qty = parseInt(qty2, 10) || 1
    if (qty < 1) qty = 1

    const unitCash = parseFloat(cash2)
    const ratio = parseFloat(ratio2)

    if (!unitCash || !ratio) {
      alert('캐시 가격과 시세 비율을 정확히 입력해주세요.')
      return
    }

    const unitGold = (unitCash / 10000) * ratio

    setRecords((prev) => [
      ...prev,
      {
        id: idCounter++,
        type: '캐시 기준',
        name: name2.trim() || '이름 없음',
        ratio,
        unitCash,
        unitGold,
        qty,
        cashValue: unitCash * qty,
        goldValue: unitGold * qty,
      },
    ])

    setName2('')
    setQty2(1)
    setCash2('')
  }

  function updateQty(id, value) {
    let newQty = parseInt(value, 10)
    if (isNaN(newQty) || newQty < 1) newQty = 1

    setRecords((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          qty: newQty,
          cashValue: item.unitCash * newQty,
          goldValue: item.unitGold * newQty,
        }
      })
    )
  }

  function changeQty(id, delta) {
    setRecords((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const newQty = Math.max(1, item.qty + delta)
        return {
          ...item,
          qty: newQty,
          cashValue: item.unitCash * newQty,
          goldValue: item.unitGold * newQty,
        }
      })
    )
  }

  function removeItem(id) {
    setRecords((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <>
      <h2>💰 거상 캐시 거래 장부</h2>

      <div className="wrapper">
        <div className="left-panel">
          <div className="box">
            <h3>1. 게임머니 단가로 추가 (캐시 도매/구매)</h3>
            <div className="input-group">
              <div>
                <label>아이템명 (선택)</label>
                <input
                  type="text"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  placeholder="예: 백호의단지"
                />
              </div>
              <div>
                <label>개수 (기본 1)</label>
                <input
                  type="number"
                  value={qty1}
                  onChange={(e) => setQty1(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <div className="input-group">
              <div>
                <label>개당 게임머니 (억)</label>
                <input
                  type="number"
                  value={gold1}
                  onChange={(e) => setGold1(e.target.value)}
                  step="0.01"
                  placeholder="예: 4.5"
                />
              </div>
              <div>
                <label>시세 비율 (만당 억)</label>
                <input
                  type="number"
                  value={ratio1}
                  onChange={(e) => setRatio1(e.target.value)}
                  step="0.1"
                  placeholder="예: 3.2"
                />
              </div>
            </div>
            <button onClick={addCashItem}>장부에 추가하기</button>
          </div>

          <div className="box">
            <h3>2. 캐시 단가로 추가 (캐시 판매/현질)</h3>
            <div className="input-group">
              <div>
                <label>아이템명 (선택)</label>
                <input
                  type="text"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  placeholder="예: 각성석"
                />
              </div>
              <div>
                <label>개수 (기본 1)</label>
                <input
                  type="number"
                  value={qty2}
                  onChange={(e) => setQty2(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <div className="input-group">
              <div>
                <label>개당 캐시 (원)</label>
                <input
                  type="number"
                  value={cash2}
                  onChange={(e) => setCash2(e.target.value)}
                  placeholder="예: 15000"
                />
              </div>
              <div>
                <label>시세 비율 (만당 억)</label>
                <input
                  type="number"
                  value={ratio2}
                  onChange={(e) => setRatio2(e.target.value)}
                  step="0.1"
                  placeholder="예: 3.2"
                />
              </div>
            </div>
            <button onClick={addGoldItem}>장부에 추가하기</button>
          </div>
        </div>

        <div className="right-panel">
          <h3>📋 거래 리스트 상세</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th rowSpan={2}>구분</th>
                  <th rowSpan={2}>아이템명</th>
                  <th rowSpan={2}>비율</th>
                  <th colSpan={2} className="sub-header">
                    개당 단가 (1개 기준)
                  </th>
                  <th rowSpan={2}>개수</th>
                  <th colSpan={2} className="sub-header">
                    총 합계 (개수 반영)
                  </th>
                  <th rowSpan={2}>삭제</th>
                </tr>
                <tr>
                  <th className="sub-header">캐시</th>
                  <th className="sub-header">게임머니</th>
                  <th className="sub-header">총 캐시</th>
                  <th className="sub-header">총 게임머니</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-msg">
                      추가된 내역이 없습니다. 좌측에서 아이템을 추가해주세요.
                    </td>
                  </tr>
                ) : (
                  records.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="type-badge">{item.type}</span>
                      </td>
                      <td className="item-name">{item.name}</td>
                      <td className="ratio">{item.ratio}</td>
                      <td className="text-cash">
                        {Math.round(item.unitCash).toLocaleString()}원
                      </td>
                      <td className="text-gold">
                        {formatGold(item.unitGold)}
                      </td>
                      <td>
                        <div className="qty-control">
                          <button
                            className="qty-btn"
                            onClick={() => changeQty(item.id, -1)}
                            aria-label="감소"
                          >
                            ❮
                          </button>
                          <input
                            type="number"
                            className="qty-input"
                            value={item.qty}
                            min="1"
                            onChange={(e) => updateQty(item.id, e.target.value)}
                          />
                          <button
                            className="qty-btn"
                            onClick={() => changeQty(item.id, 1)}
                            aria-label="증가"
                          >
                            ❯
                          </button>
                        </div>
                      </td>
                      <td className="text-cash bg-light-gray">
                        {Math.round(item.cashValue).toLocaleString()}원
                      </td>
                      <td className="text-gold bg-light-gray">
                        {formatGold(item.goldValue)}
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="total-box">
            <div className="total-cash">
              총 거래 캐시:{' '}
              <span>{Math.round(totals.cash).toLocaleString()}원</span>
            </div>
            <div className="total-gold">
              총 거래 게임머니: <span>{formatGold(totals.gold)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
