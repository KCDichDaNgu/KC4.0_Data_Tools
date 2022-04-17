import re
from collections import Counter, OrderedDict

def getShortestAndLongestSentence(sentence_array):
    init_len = len(split_into_words(sentence_array[0]))
    short = init_len
    long = init_len
    for sentence in sentence_array:
        cur_len = len(split_into_words(sentence))
        if short > cur_len:
            short = cur_len
        if long < cur_len:
            long = cur_len
    return short, long

def split_into_words(sentence):
    import re
    word_regex_improved = r"(\w[\w']*\w|\w)"
    word_matcher = re.compile(word_regex_improved)
    return word_matcher.findall(sentence)

def create_report(sentences):
    if len(sentences) == 0:
        return {
        "total_file": 0,
        "sentence_num": 0,
        "word_num": 0,
        "dict_size": 0,
        "longest_sentence": 0,
        "shortest_setence": 0,
        "word_num_avg": 0,
        "word_count": []
    }
    total_file = len(sentences)
    sentence_num = 0
    word_num = 0
    longest_sentence = sentences[0].sentence_data.longest_sentence
    shortest_setence = sentences[0].sentence_data.shortest_sentence
    word_count = Counter({})
    for sentence in sentences:
        sentence_num += sentence.sentence_data.sentence_num
        word_num += sentence.sentence_data.word_num
        word_count = word_count + Counter(sentence.sentence_data.word_count)
        if shortest_setence > sentence.sentence_data.shortest_sentence:
            shortest_setence = sentence.sentence_data.shortest_sentence
        if longest_sentence < sentence.sentence_data.longest_sentence:
            longest_sentence = sentence.sentence_data.longest_sentence

    dict_size = len(word_count)
    word_num_avg = word_num/sentence_num
    sorted_word_count = []
    for item in word_count.most_common():
        sorted_word_count.append({
            "word": item[0],
            "count": item[1]
        })
    
    return {
        "total_file": total_file,
        "sentence_num": sentence_num,
        "word_num": word_num,
        "dict_size": dict_size,
        "longest_sentence": longest_sentence,
        "shortest_setence": shortest_setence,
        "word_num_avg": word_num_avg,
        "word_count": sorted_word_count
    }