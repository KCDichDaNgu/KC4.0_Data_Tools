import os
import glob
from tqdm import tqdm
import re
import time
from shutil import copyfile
from datetime import datetime
import requests

from database.models.para_document import (
    ParaDocument, 
    Editor, 
    NewestParaDocument, 
    OriginalParaDocument,
    ParaDocumentText
)
from database.models.para_sentence import (
    ParaSentence, 
    Editor, 
    NewestParaSentence, 
    OriginalParaSentence,
    ParaSentenceText
)
from database.models.domain import Domain
from api.document.utils import hash_para_document
from api.para_sentence.utils import hash_para_sentence
from constants.common import API_ALIGN_DOCUMENT, API_SCORE_DOCUMENT
from utils.env import read_env_files

def get_all_prefixs(filepaths):
    filenames = [os.path.basename(filepath) for filepath in filepaths]
    prefixs = set()

    for filename in filenames:
        basename, ext = os.path.splitext(filename)
        prefix = basename[:-2]
        prefixs.add(prefix)

    prefixs = list(sorted(prefixs))

    return prefixs

def check_valid_file_pair(src_document_path, tgt_document_path):
    if not os.path.isfile(src_document_path) or not os.path.isfile(tgt_document_path):
        return {
            "success": False,
            "message": "Thiếu cặp file. Phải đảm bảo tồn tại 1 cặp file của 2 ngôn ngữ với cùng tiền tố."
        }

    # src_lines = open(src_document_path, encoding='utf8').readlines()
    # tgt_lines = open(tgt_document_path, encoding='utf8').readlines()

    # if len(src_lines) != len(tgt_lines):
    #     return {
    #         "success": False,
    #         "message": "Số dòng của 2 files khác nhau."
    #     }

    return {
        "success": True,
        "message": "Cặp file đạt tiêu chuẩn"
    }

def align_documents(src_text, tgt_text, src_lang, tgt_lang):
    res = requests.post(
        API_ALIGN_DOCUMENT[f'{src_lang}-{tgt_lang}'] ,
        json={
            "source": src_text,
            "target": tgt_text,
            "type": f'{src_lang[0]}{tgt_lang[0]}'
        }
    ).json()

    if res['isvalid']:
        sentences = res['sentences']

        return sentences
    else:
        return []

def get_documents_score(src_text, tgt_text, src_lang, tgt_lang):
    if (src_lang == 'vi' and tgt_lang == 'lo') or (src_lang == 'lo' and tgt_lang == 'vi'):
        res = requests.post(
            API_SCORE_DOCUMENT[f'{src_lang}-{tgt_lang}'] ,
            json={
                "source": src_text,
                "target": tgt_text,
                "type": f'{src_lang[0]}{tgt_lang[0]}'
            }
        ).json()
        
        return res['score']

    elif (src_lang == 'km' and tgt_lang == 'vi') or (src_lang == 'vi' and tgt_lang == 'km'):
        res = requests.post(
            API_SCORE_DOCUMENT[f'{src_lang}-{tgt_lang}'] ,
            json={
                "source": src_text,
                "target": tgt_text,
                "type": f'{src_lang}-{tgt_lang}'
            }
        ).json()
        
        return res['data']['score']

    elif (src_lang == 'zh' and tgt_lang == 'vi') or (src_lang == 'vi' and tgt_lang == 'zh'):
        res = requests.post(
            API_SCORE_DOCUMENT[f'{src_lang}-{tgt_lang}'] ,
            json={
                "source": src_text,
                "target": tgt_text,
                "type": 'vi-zh'
            }
        )
        try:
            res = res.json()
        except Exception as err:
            raise Exception(f"Lỗi API.")
        
        return res['data']['score']


def create_para_document(src_document_path, tgt_document_path, domain, src_lang, tgt_lang):
    src_text = open(src_document_path, encoding='utf8').read().strip()
    tgt_text = open(tgt_document_path, encoding='utf8').read().strip()

    hash_content = hash_para_document(
        src_text, 
        tgt_text, 
        src_lang, 
        tgt_lang
    )

    try:
        message = ""

        # get score
        try:
            score = get_documents_score(src_text, tgt_text, src_lang, tgt_lang)
        except Exception as err:
            # print('get score error', err)
            score = None

            return {
                "success": False,
                "message": f"Lỗi lấy điểm cặp câu: {str(err)}"
            }

        para_doc = ParaDocument(
            newest_para_document=NewestParaDocument(
                text1=ParaDocumentText(
                    content=src_text,
                    lang=src_lang
                ),
                text2=ParaDocumentText(
                    content=tgt_text,
                    lang=tgt_lang
                ),
                hash_content=hash_content
            ),
            
            original_para_document=OriginalParaDocument(
                text1=ParaDocumentText(
                    content=src_text,
                    lang=src_lang
                ),
                text2=ParaDocumentText(
                    content=tgt_text,
                    lang=tgt_lang
                ),
                hash_content=hash_content
            ),
            score={'docAlign': score},
            alignment_status=ParaDocument.ALIGNMENT_STATUSES['not_aligned_yet'],
            created_by=ParaDocument.CREATED_BY['by_machine'],
            created_at=time.time(),
            updated_at=time.time(),
            domain_id=domain.id
        )
        
        para_doc.save()

        # gọi tool gióng hàng
        # try:
        #     sentences = align_documents(src_text, tgt_text, src_lang, tgt_lang)
        #     para_doc.update(alignment_status=ParaDocument.ALIGNMENT_STATUSES['aligned'])
        # except Exception as err:
        #     sentences = []
        #     print('error align document', err)
        #     message += f'\nLỗi gióng hàng văn bản: {str(err)}'

        # try:
        #     n_add_sentences = 0
        #     n_dup_sentences = 0
        #     n_unknown_error = 0

        #     for sentence in sentences:
        #         try:
        #             create_para_sentence(domain, sentence['source'], sentence['target'], src_lang, tgt_lang, score=sentence['score'])
        #             n_add_sentences += 1
        #         except Exception as err:
        #             if str(err) == "hashExists":
        #                 n_dup_sentences += 1
        #             else:
        #                 n_unknown_error += 1
            
        #     message += f'\nĐã thêm vào {n_add_sentences} cặp câu'\
        #         f'\n{n_dup_sentences} cặp câu trùng lặp không được thêm vào'\
        #         f'\n{n_unknown_error} cặp câu gặp lỗi không lường trước'
        # except Exception as err:
        #     message += f'\nLỗi khi thêm cặp câu: {str(err)}'

        return {
            "success": True,
            "message": "Đã thêm vào cặp văn bản." + message
        }

    except Exception as err:
        if str(err) == "hashExists":
            return {
                "success": True,
                "message": "Bản ghi đã có trong hệ thống"
            }
        else:
            return {
                "success": False,
                "message": f"Lỗi không lường trước. {str(err)}."
            }


def create_para_sentence(domain, src_text, tgt_text, src_lang, tgt_lang, score=None):
    hash = hash_para_sentence(src_text, tgt_text, src_lang, tgt_lang)

    para_sentence = ParaSentence(
        newest_para_sentence=NewestParaSentence(
            text1=ParaSentenceText(
                content=src_text,
                lang=src_lang
            ),
            text2=ParaSentenceText(
                content=tgt_text,
                lang=tgt_lang
            ),
            hash_content=hash
        ),
        original_para_sentence=OriginalParaSentence(
            text1=ParaSentenceText(
                content=src_text,
                lang=src_lang
            ),
            text2=ParaSentenceText(
                content=tgt_text,
                lang=tgt_lang
            ),
            hash_content=hash
        ),
        score={'senAlign': score},
        created_at=time.time(),
        updated_at=time.time(),
        domain_id=domain.id
    )

    para_sentence.save()

def add_para_sentences_from_file(sentence_file, domain, src_lang, tgt_lang):
    try:
        n_success = 0
        n_error_missing_pair = 0
        n_error_duplicated = 0
        error_unknowns = []

        try:
            lines = open(sentence_file, encoding='utf-8').readlines()
        except UnicodeDecodeError as err:
            try:
                lines = open(sentence_file, encoding='utf-16').readlines()
            except:
                return {
                    "success": False,
                    "message": "Không thể mở file. Format của file phải ở dạng utf-8 or utf-16"
                }
        
        for line in lines:
            src_text, tgt_text = line.strip('\n').split('\t')
            if len(src_text.strip()) == 0 or len(tgt_text.strip()) == 0:
                n_error_missing_pair += 1
                continue

            try:
                create_para_sentence(domain, src_text, tgt_text, src_lang, tgt_lang)
                n_success += 1
            except Exception as err:
                if str(err) == "hashExists":
                    n_error_duplicated += 1
                else:
                    error_unknowns.append(str(err))

        error_unknown_message = '\n'.join(error_unknowns)
        return {
            "success": True,
            "message": f"Đã thêm vào {n_success} cặp câu."\
                f"\n{n_error_duplicated} cặp câu trùng lặp -> không được thêm vào."\
                f"\n{n_error_missing_pair} cặp câu không đủ cặp (chỉ có vế trái hoặc chỉ có vế phải) -> không được thêm vào."\
                f"\n{len(error_unknowns)} cặp câu gặp lỗi không lường trước -> không được thêm vào. Các lỗi không lường trước: {error_unknown_message}"
        }
    except Exception as err:
        return {
            "success": False,
            "message": f"Lỗi không lường trước! {str(err)}"
        }

def make_parent_dir(filepath):
    parent_dir = os.path.dirname(filepath)

    if not os.path.isdir(parent_dir):
        os.makedirs(parent_dir)

def is_sentence_filename_valid(sentence_filename, true_langs):
    src_lang, tgt_lang = get_src_tgt_languages_in_filename(sentence_filename)
    return src_lang in true_langs and tgt_lang in true_langs

def get_src_tgt_languages_in_filename(sentence_filename):
    basename, ext = os.path.splitext(sentence_filename)
    language = basename[-5:]
    src_lang, tgt_lang = language.split('-')
    return src_lang, tgt_lang

def add_para_documents_from_local(bitextor_path, bitextor_done_path, bitextor_err_path, bitextor_log_path):
    language_pairs = sorted(os.listdir(bitextor_path))

    today = datetime.today().strftime('%Y-%m-%d-%H-%M-%S')
    log_summary_text = ""

    for language_pair in tqdm(language_pairs, desc="Adding documents"):
        langs = language_pair.split('-')
        src_lang, tgt_lang = langs

        # # tạm thời chỉ chạy import việt lào , viet-khmer
        # if language_pair != 'vi-lo' and language_pair != 'lo-vi' and language_pair != 'vi-km' and language_pair != 'km-vi':
        #     continue

        # domain 
        domains = sorted(os.listdir(f"{bitextor_path}/{language_pair}"))

        for domain_url in domains:
            domain = find_or_create_domain(domain_url)

            document_path = f"{bitextor_path}/{language_pair}/{domain_url}/documents"
            
            all_document_files = os.listdir(document_path)
            prefixs = get_all_prefixs(all_document_files)

            for prefix in prefixs:
                src_document_path = f"{bitextor_path}/{language_pair}/{domain_url}/documents/{prefix}{src_lang}.txt"
                tgt_document_path = f"{bitextor_path}/{language_pair}/{domain_url}/documents/{prefix}{tgt_lang}.txt"

                src_done_path = f"{bitextor_done_path}/{language_pair}/{domain_url}/documents/{prefix}{src_lang}.txt"
                tgt_done_path = f"{bitextor_done_path}/{language_pair}/{domain_url}/documents/{prefix}{tgt_lang}.txt"

                src_err_path = f"{bitextor_err_path}/{language_pair}/{domain_url}/documents/{prefix}{src_lang}.txt"
                tgt_err_path = f"{bitextor_err_path}/{language_pair}/{domain_url}/documents/{prefix}{tgt_lang}.txt"

                log_path = f"{bitextor_log_path}/{language_pair}/documents/{prefix}.txt"

                if os.path.isfile(src_done_path) and os.path.isfile(tgt_done_path):
                    # both files are already processed succesfully
                    continue
                # err files will be reprocessed

                check_dict = check_valid_file_pair(src_document_path, tgt_document_path)

                if not check_dict['success']:
                    # add to err files
                    make_parent_dir(src_err_path)
                    copyfile(src_document_path, src_err_path)
                    copyfile(tgt_document_path, tgt_err_path)

                    message = check_dict['message']
                else:
                    success_dict = create_para_document(
                        src_document_path, 
                        tgt_document_path, 
                        domain, 
                        src_lang, 
                        tgt_lang)
                    
                    if success_dict['success']:
                        # add file to done
                        make_parent_dir(src_done_path)
                        copyfile(src_document_path, src_done_path)
                        copyfile(tgt_document_path, tgt_done_path)

                        if os.path.isfile(src_err_path):
                            os.remove(src_err_path)
                        if os.path.isfile(tgt_err_path):
                            os.remove(tgt_err_path)
                    else:
                        # add file to err
                        make_parent_dir(src_err_path)
                        copyfile(src_document_path, src_err_path)
                        copyfile(tgt_document_path, tgt_err_path)
                    
                    message = success_dict['message']

                # write log
                make_parent_dir(log_path)
                with open(log_path, 'w+', encoding='utf8') as fp:
                    fp.write(message)

                # summary log
                log_summary_text += '\n======='\
                    f'\nFile pair {src_document_path} - {tgt_document_path}:'\
                    f'\n{message}'
                
    if len(log_summary_text) > 0:
        # check latest log, if same content => not write
        latest_log = get_latest_document_log(bitextor_log_path)

        if latest_log is not None:
            latest_content = open(latest_log, encoding='utf8').read()

            if latest_content == log_summary_text:
                return

        log_summary_fp = open(f"{bitextor_log_path}/document-log-summary-{today}.log", 'w+', encoding='utf8')
        log_summary_fp.write(log_summary_text)
        log_summary_fp.close()
    # else:
    #     log_summary_fp.write('Nothing to do')
    
def get_latest_document_log(bitextor_log_path):
    document_log_files = sorted(glob.glob(f"{bitextor_log_path}/document-*"))
    if len(document_log_files) == 0:
        return None
    return document_log_files[-1]

def find_or_create_domain(domain_url):
    domain = Domain.objects(url=domain_url).first()
    if domain is None:
        domain = Domain(
            url=domain_url
        )
        domain.save()

    return domain


def add_para_sentences_from_local(bitextor_path, bitextor_done_path, bitextor_err_path, bitextor_log_path):
    language_pairs = os.listdir(bitextor_path)

    today = datetime.today().strftime('%Y-%m-%d-%H-%M-%S')
    log_summary_text = ""

    for language_pair in tqdm(language_pairs, desc="Adding sentences"):
        # domain 
        domains = os.listdir(f"{bitextor_path}/{language_pair}")

        for domain_url in domains:
            domain = find_or_create_domain(domain_url)

            sentence_path = f"{bitextor_path}/{language_pair}/{domain_url}/sentences"

            langs = language_pair.split('-')
            
            all_sentence_files = os.listdir(sentence_path)

            for sentence_filename in all_sentence_files:
                sentence_filepath = f"{bitextor_path}/{language_pair}/{domain_url}/sentences/{sentence_filename}"
                sentence_donepath = f"{bitextor_done_path}/{language_pair}/{domain_url}/sentences/{sentence_filename}"
                sentence_errpath = f"{bitextor_err_path}/{language_pair}/{domain_url}/sentences/{sentence_filename}"
                sentence_logpath = f"{bitextor_log_path}/{language_pair}/{domain_url}/sentences/{sentence_filename}"

                if is_sentence_filename_valid(sentence_filename, langs):
                    if os.path.isfile(sentence_donepath): # file already processed successfully
                        continue
                    # err files will be reprocessed

                    src_lang, tgt_lang = get_src_tgt_languages_in_filename(sentence_filename)
                    success_dict = add_para_sentences_from_file(sentence_filepath, domain, src_lang, tgt_lang)
                    
                    if success_dict['success']:
                        # add file to done
                        make_parent_dir(sentence_donepath)
                        copyfile(sentence_filepath, sentence_donepath)

                        if os.path.isfile(sentence_errpath):
                            os.remove(sentence_errpath)
                    else:
                        # add file to err
                        make_parent_dir(sentence_errpath)
                        copyfile(sentence_filepath, sentence_errpath)
                else:
                    success_dict = {
                        "success": False,
                        "message": f"Tên file không đúng định dạng, không tìm thấy cặp ngôn ngữ {language_pair} ở cuối file."
                    }

                # write log
                make_parent_dir(sentence_logpath)
                with open(sentence_logpath, 'w+', encoding='utf8') as fp:
                    fp.write(success_dict["message"])

                # summary log
                log_summary_text += '\n======='\
                    f'\nFile {sentence_filepath}:'\
                    f'\n{success_dict["message"]}'

    if len(log_summary_text) > 0:
        log_summary_fp = open(f"{bitextor_log_path}/sentence-log-summary-{today}.log", 'w+', encoding='utf8')
        log_summary_fp.write(log_summary_text)
        log_summary_fp.close()
    # else:
    #     log_summary_fp.write('Nothing to do')
    

def makedirs(path):
    if not os.path.isdir(path):
        os.makedirs(path)

def add_all_documents_and_sentences_in_local():
    env = read_env_files()
    bitextor_path = env['BITEXTOR_PATH']
    bitextor_done_path = env['BITEXTOR_DONE_PATH']
    bitextor_err_path = env['BITEXTOR_ERR_PATH']
    bitextor_log_path = env['BITEXTOR_LOG_PATH']

    if not os.path.isdir(bitextor_path):
        print("BITEXTOR_PATH not found. Check .env file")
        return

    makedirs(bitextor_done_path)
    makedirs(bitextor_err_path)
    makedirs(bitextor_log_path)

    add_para_sentences_from_local(
        bitextor_path, 
        bitextor_done_path, 
        bitextor_err_path, 
        bitextor_log_path)
    add_para_documents_from_local(
        bitextor_path, 
        bitextor_done_path, 
        bitextor_err_path, 
        bitextor_log_path
        )


if __name__ == '__main__':
    add_all_documents_and_sentences_in_local()
