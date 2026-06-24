import json
import sys
sys.path.insert(0, 'backend')
from main import SimpleMineScheduler

# Load user output
user = json.load(open('outputformat/zuck_medium.txt', encoding='utf-8'))
user_map = {(r['block_id']): r for r in user}

# Run backend
s = SimpleMineScheduler()
s.load_prec('dataset/zuck_medium.prec')
s.load_pcpsp('dataset/zuck_medium.pcpsp')
s.solve()

expected = []
for b, t in sorted(s.mined_time.items(), key=lambda x: (x[1], x[0])):
    block = s.blocks[b]
    dest = 0 if block.profit_ore >= block.profit_waste else 1
    expected.append({'block_id': b, 'destination': dest, 'time_period': t})

print('USER_ROWS', len(user))
print('EXPECTED_ROWS', len(expected))
print('NBLOCKS_HEADER', len(s.blocks))
print('PERIODS', s.T)
print('DISCOUNT', s.discount)

mismatches = 0
for e in expected[:5000]:
    u = user_map.get(e['block_id'])
    if not u or u['destination'] != e['destination'] or u['time_period'] != e['time_period']:
        mismatches += 1
        if mismatches <= 5:
            print('MISMATCH', e, u)

for e in expected[-5:]:
    u = user_map.get(e['block_id'])
    print('TAIL', e, 'USER', u)

full_mismatch = sum(
    1 for e in expected
    if user_map.get(e['block_id']) != e
)
print('FULL_MISMATCHES', full_mismatch)
print('MATCH', full_mismatch == 0)