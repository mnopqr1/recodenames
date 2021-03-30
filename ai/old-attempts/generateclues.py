from typing import List, Tuple
import gensim
import sys
from pprint import pprint
from itertools import combinations

from operator import itemgetter
MAX_SIM_SEARCH = 10
# GROUP_SIZE = 2
SHOW_EVERYTHING = True
SOURCEFILENAME = '../server/google-news-slim.bin'
# N_TO_SHOW = 5

# read command-line arguments
i = 1
target = []
to_avoid = []
while (i < len(sys.argv) - 3):
    target.append(sys.argv[i])
    i += 1
GROUP_SIZE = int(sys.argv[i])
i += 1
N_TO_SHOW = int(sys.argv[i])
i += 1
VOCAB_SIZE = int(sys.argv[i])

print("")
print("*"*60)
print("Using word2vec trained with " + SOURCEFILENAME) 
print("to search for best clue for the words:")
print(', '.join(target))
print("Group size:", GROUP_SIZE)
print("*"*60)

model = gensim.models.KeyedVectors.load_word2vec_format(SOURCEFILENAME, binary=True, limit=500000)


def is_valid_clue(group, clue):
    for word in group:
        if clue.lower() in word.lower() or word.lower() in clue.lower():
            return False
    return True

def best_valid_clues(group, avoid=[]):
    most_sim = model.most_similar(positive=group, negative=avoid, restrict_vocab=VOCAB_SIZE, topn=MAX_SIM_SEARCH)
    # most_sim = model.most_similar_cosmul(positive=group, negative=(), topn=MAX_SIM_SEARCH)
    return [clue for clue in most_sim if is_valid_clue(group,clue[0])]

possibleclues = []
bestscore = 0
bestclues = []

for i in range(GROUP_SIZE,GROUP_SIZE+1):
    for group in combinations(target, i):
        solvegroup: List[Tuple[str, int]] = best_valid_clues(group=group, avoid=to_avoid)
        possibleclues.append((group, solvegroup))
        bestclue = list(solvegroup[0])

# sort by best-of-three average
# possibleclues.sort(key=lambda tup: sum([clue[1] for clue in tup[1][:3]]))
possibleclues.sort(key=lambda tup: tup[1][0][1], reverse=True)

print("OK, here are some of the best clues I found:")
print()
for i in range(0, N_TO_SHOW):
    print("For the group ", end= "")
    print(possibleclues[i][0].__repr__(), end=", ")
    print("I found the clues: ", end="")
    print(', '.join(clue.__repr__() for clue in possibleclues[i][1][:3]))
    print()


#possibleclues_sorted_by_score = { k : v for k,v in reversed(sorted(possibleclues.items(), key = itemgetter(1)[0])}
# pprint(possibleclues_sorted_by_score)