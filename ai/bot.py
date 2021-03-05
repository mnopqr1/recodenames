import gensim
from pprint import pprint
from itertools import combinations

model = gensim.models.KeyedVectors.load_word2vec_format('GoogleNews-vectors-negative300-SLIM.bin', binary=True, limit=500000)

#print("Most common: ", model.index2word[:50])
#print("Least common:", model.index2word[-50:])

board = { 'blue' : ['chest', 'belt', 'whip', 'space', 'cliff', 'flat', 'fighter', 'dressing', 'blizzard'],
'red' : ['mummy', 'sloth', 'chalk', 'van', 'sled', 'attic', 'state', 'ice'],
'black' : ['steam'],
'white' : ['yard', 'web','pie', 'shampoo', 'scientist', 'octopus', 'roll']}

# print(sum(len(l) for l in board.values()))

# pprint(model.similar_by_word('belt', topn = 10))
# pprint(model.most_similar(positive=board['blue'], negative=board['red'], restrict_vocab=50000, topn=20))

def is_valid_clue(group, clue):
    for word in group:
        if clue.lower() in word.lower() or word.lower() in clue.lower():
            return False
    return True

MAX_SIM_SEARCH = 10
def best_valid_clue(group, avoid):
    most_sim = model.most_similar(positive=group, negative=board['red'], restrict_vocab=5000, topn=MAX_SIM_SEARCH)
    i = 0
    while (i < MAX_SIM_SEARCH):
        if is_valid_clue(group, most_sim[i][0]):
            return most_sim[i]
        i += 1
    raise ValueError("No allowable clues found for group: ", group)

possibleclues = {}
MIN_GROUP = 2
MAX_GROUP = 4
for i in range(MIN_GROUP,MAX_GROUP):
    for group in combinations(board['red'], i):
        solvegroup = best_valid_clue(group=group,avoid=board['blue'])
        possibleclues[group] = solvegroup

possibleclues_sorted_by_score = { k : v for k,v in sorted(possibleclues.items(), key = lambda item: item[1][1])}
pprint(possibleclues_sorted_by_score)