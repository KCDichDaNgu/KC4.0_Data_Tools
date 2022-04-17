from database.db import init_for_migrate
from database.models.para_sentence import ParaSentence 
from database.models.para_sentence_history import ParaSentenceHistory
from tqdm import tqdm
from api.para_sentence.utils import hash_para_sentence

def rehash_original():
    para_sentences = ParaSentence.objects.all()
    for para_sentence in tqdm(para_sentences, desc="Rehash original"):
        if para_sentence.original is None:
            continue
        text1 = para_sentence.original.text1
        text2 = para_sentence.original.text2
        lang1 = para_sentence.lang1
        lang2 = para_sentence.lang2
        hash = hash_para_sentence(text1, text2, lang1, lang2)
        para_sentence.update(hash=hash)

def connect_para_history_to_para_sentence():
    para_sentence_histories = ParaSentenceHistory.objects.all()

    cant_connects = []
    for history in tqdm(para_sentence_histories, desc="Connect parasentence history"):
        # if not found editor_id -> original para sentence
        if history.para_sentence_id is not None:
            continue
        if history.editor_id is None:
            text1 = history.text1 
            text2 = history.text2
            para_sentences = ParaSentence.objects.filter(__raw__={
                'original.text1': text1,
                'original.text2': text2
            })
            if len(para_sentences) == 1:
                para_sentence_id = para_sentences[0].id
                history.update(para_sentence_id=para_sentence_id)
            else:
                cant_connects.append(history.id)
        else:
            updated_at = history.updated_at
            para_sentences = ParaSentence.objects.filter(updated_at=updated_at)
            if len(para_sentences) == 1:
                para_sentence_id = para_sentences[0].id
                history.update(para_sentence_id=para_sentence_id)
            else:
                cant_connects.append(history.id)

    print('These history can\'t be connected. Update them by hand.')
    print(cant_connects)

init_for_migrate()
rehash_original()
connect_para_history_to_para_sentence()
