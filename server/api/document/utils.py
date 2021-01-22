from constants.common import DOC_ALIGNMENT_FILE_DIR

import os, time

def save_to_local_file(data):

    text1 = data['text1']
    lang1 = data['lang1']

    text2 = data['text2']
    lang2 = data['lang2']

    new_dir_path = f'{DOC_ALIGNMENT_FILE_DIR}/{time.time()}'

    if not os.path.isdir(new_dir_path):
        os.makedirs(new_dir_path)

    file1_path = f'{new_dir_path}/{lang1}.txt'
    file2_path = f'{new_dir_path}/{lang2}.txt'

    with open(file1_path, 'w+') as f:
        f.write(text1)

        f.close()

    with open(file2_path, 'w+') as f: 
        f.write(text2)

        f.close()

    return {
        'lang1': lang1,
        'lang2': lang2,
        'file1_path': file1_path,
        'file2_path': file2_path
    }
