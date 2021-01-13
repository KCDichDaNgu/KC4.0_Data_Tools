from database.db import init_for_migrate
from database.models.para_sentence import ParaSentence, Editor, NewestParaSentence, OriginalParaSentence
from database.models.para_sentence_history import ParaSentenceHistory
from database.models.user import User
from tqdm import tqdm


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

def change_db():
    para_sentences = ParaSentence.objects.all

    for para_sentence in tqdm(para_sentences, desc="Update parasentence"):
        histories = ParaSentenceHistory.objects.filter(para_sentence_id=para_sentence.id).sort('updated_at', -1)
        if len(histories) > 0:
            last_update = histories[0]
        else:
            last_update = None

        editor = None
        if para_sentence.editor_id is not None:
            user = User.get(id=para_sentence.editor_id)
            editor = {
                'id': para_sentence.editor_id,
                'roles': user.roles
            }

        original_para_sentence = None
        if para_sentence.original_para_sentence is not None:
            original_para_sentence = {
                'text1': {
                    'content': para_sentence['original']['text1'],
                    'lang': para_sentence['lang1']
                },
                'text2': {
                    'content': para_sentence['original']['text2'],
                    'lang': para_sentence['lang2']
                },
                'rating': para_sentence['original']['rating'],
                'hash_content': para_sentence['hash']
            }
        else:
            original_para_sentence = {
                'text1': {
                    'content': para_sentence['text1'],
                    'lang': para_sentence['lang1']
                },
                'text2': {
                    'content': para_sentence['text2'],
                    'lang': para_sentence['lang2']
                },
                'rating': para_sentence['rating'],
                'hash_content': para_sentence['hash']
            }

        para_sentence.update(
            newest_para_sentence={
                'text1': {
                    'content': para_sentence['text1'],
                    'lang': para_sentence['lang1']
                },
                'text2': {
                    'content': para_sentence['text2'],
                    'lang': para_sentence['lang2']
                },
                'rating': para_sentence['rating'],
                'hash_content': para_sentence['hash']
            },
            original_para_sentence=original_para_sentence,
            editor=editor,
            last_history_record_id=last_update.id if last_update is not None else None
        )

        for history in histories:
            editor = None
            if history.editor is not None:
                user = User.get(id=history.editor_id)
                editor = {
                    'id': history.editor_id,
                    'roles': user.roles
                }
            history.update(
                newest_para_sentence={
                    'text1': {
                        'content': history.text1,
                        'lang': history.lang1
                    },
                    'text2': {
                        'content': history.text2,
                        'lang': history.lang2
                    },
                    'rating': history.rating,
                    'hash_content': history.hash
                },
                editor=editor
            )


init_for_migrate()
connect_para_history_to_para_sentence()
