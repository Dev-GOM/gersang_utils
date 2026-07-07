import { useState, useMemo, useEffect } from 'react'
import './App.css'

let idCounter = 0

const ITEM_PRESETS_KEY = 'gersang_item_presets'
const LEDGER_SNAPSHOTS_KEY = 'gersang_ledger_snapshots'

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

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
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

  // 프리셋 / 스냅샷
  const [itemPresets, setItemPresets] = useState(() =>
    loadFromStorage(ITEM_PRESETS_KEY, [])
  )
  const [snapshots, setSnapshots] = useState(() =>
    loadFromStorage(LEDGER_SNAPSHOTS_KEY, [])
  )
  const [snapshotName, setSnapshotName] = useState('')

  useEffect(() => {
    saveToStorage(ITEM_PRESETS_KEY, itemPresets)
  }, [itemPresets])

  useEffect(() => {
    saveToStorage(LEDGER_SNAPSHOTS_KEY, snapshots)
  }, [snapshots])

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

  function buildRecord(type, name, qty, ratio, unitCash, unitGold) {
    return {
      id: idCounter++,
      type,
      name,
      ratio,
      unitCash,
      unitGold,
      qty,
      cashValue: unitCash * qty,
      goldValue: unitGold * qty,
    }
  }

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
      buildRecord('머니 기준', name1.trim() || '이름 없음', qty, ratio, unitCash, unitGold),
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
      buildRecord('캐시 기준', name2.trim() || '이름 없음', qty, ratio, unitCash, unitGold),
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

  // 아이템 프리셋
  function saveItemPreset(type) {
    if (type === 'cash') {
      const unitGold = parseFloat(gold1)
      const ratio = parseFloat(ratio1)
      if (!unitGold || !ratio) {
        alert('저장할 값(게임머니, 비율)을 먼저 입력해주세요.')
        return
      }
      setItemPresets((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: name1.trim() || '이름 없음',
          type: 'cash',
          qty: parseInt(qty1, 10) || 1,
          value: unitGold,
          ratio,
        },
      ])
      alert('프리셋을 저장했습니다.')
    } else {
      const unitCash = parseFloat(cash2)
      const ratio = parseFloat(ratio2)
      if (!unitCash || !ratio) {
        alert('저장할 값(캐시, 비율)을 먼저 입력해주세요.')
        return
      }
      setItemPresets((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: name2.trim() || '이름 없음',
          type: 'gold',
          qty: parseInt(qty2, 10) || 1,
          value: unitCash,
          ratio,
        },
      ])
      alert('프리셋을 저장했습니다.')
    }
  }

  function applyItemPreset(preset) {
    if (preset.type === 'cash') {
      setName1(preset.name)
      setQty1(preset.qty)
      setGold1(preset.value)
      setRatio1(preset.ratio)
    } else {
      setName2(preset.name)
      setQty2(preset.qty)
      setCash2(preset.value)
      setRatio2(preset.ratio)
    }
  }

  function deleteItemPreset(id) {
    setItemPresets((prev) => prev.filter((p) => p.id !== id))
  }

  function addFromPreset(preset) {
    if (preset.type === 'cash') {
      const unitGold = preset.value
      const ratio = preset.ratio
      const unitCash = (unitGold / ratio) * 10000
      setRecords((prev) => [
        ...prev,
        buildRecord('머니 기준', preset.name, preset.qty, ratio, unitCash, unitGold),
      ])
    } else {
      const unitCash = preset.value
      const ratio = preset.ratio
      const unitGold = (unitCash / 10000) * ratio
      setRecords((prev) => [
        ...prev,
        buildRecord('캐시 기준', preset.name, preset.qty, ratio, unitCash, unitGold),
      ])
    }
  }

  // 장부 스냅샷
  function saveSnapshot() {
    const name = snapshotName.trim()
    if (!name) {
      alert('저장할 장부 이름을 입력해주세요.')
      return
    }
    if (records.length === 0) {
      alert('저장할 거래 내역이 없습니다.')
      return
    }
    setSnapshots((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        createdAt: new Date().toISOString(),
        records: [...records],
      },
    ])
    setSnapshotName('')
    alert(`[${name}] 장부를 저장했습니다.`)
  }

  function loadSnapshot(id) {
    const snapshot = snapshots.find((s) => s.id === id)
    if (!snapshot) return

    // id 충돌 방지를 위해 레코드 id 재생성
    const restored = snapshot.records.map((r) => ({
      ...r,
      id: idCounter++,
    }))
    setRecords(restored)
  }

  function deleteSnapshot(id) {
    setSnapshots((prev) => prev.filter((s) => s.id !== id))
  }

  function formatDate(iso) {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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
            <button className="preset-save-btn" onClick={() => saveItemPreset('cash')}>
              현재 입력을 프리셋으로 저장
            </button>
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
            <button className="preset-save-btn" onClick={() => saveItemPreset('gold')}>
              현재 입력을 프리셋으로 저장
            </button>
          </div>

          <div className="box preset-box">
            <h3>⭐ 자주 쓰는 아이템 프리셋</h3>
            {itemPresets.length === 0 ? (
              <p className="empty-preset">위 입력란에서 값을 입력한 뒤 "프리셋으로 저장" 버튼을 눌러보세요.</p>
            ) : (
              <div className="preset-list">
                {itemPresets.map((preset) => (
                  <div key={preset.id} className="preset-chip">
                    <div className="preset-info">
                      <span className="preset-name">{preset.name}</span>
                      <span className="preset-detail">
                        {preset.type === 'cash'
                          ? `${preset.value}억 / 비율 ${preset.ratio}`
                          : `${preset.value.toLocaleString()}원 / 비율 ${preset.ratio}`}
                      </span>
                    </div>
                    <div className="preset-actions">
                      <button className="apply-btn" onClick={() => applyItemPreset(preset)}>
                        불러오기
                      </button>
                      <button className="add-btn" onClick={() => addFromPreset(preset)}>
                        추가
                      </button>
                      <button className="delete-btn" onClick={() => deleteItemPreset(preset.id)}>
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="right-panel">
          <div className="box snapshot-box">
            <h3>💾 장부 저장 / 불러오기</h3>
            <div className="snapshot-input-group">
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="예: 7/7 거래 장부"
              />
              <button onClick={saveSnapshot}>현재 장부 저장</button>
            </div>
            {snapshots.length > 0 && (
              <div className="snapshot-list">
                {snapshots.map((snapshot) => (
                  <div key={snapshot.id} className="snapshot-item">
                    <div className="snapshot-info">
                      <span className="snapshot-name">{snapshot.name}</span>
                      <span className="snapshot-date">{formatDate(snapshot.createdAt)}</span>
                      <span className="snapshot-count">{snapshot.records.length}건</span>
                    </div>
                    <div className="snapshot-actions">
                      <button className="apply-btn" onClick={() => loadSnapshot(snapshot.id)}>
                        불러오기
                      </button>
                      <button className="delete-btn" onClick={() => deleteSnapshot(snapshot.id)}>
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
