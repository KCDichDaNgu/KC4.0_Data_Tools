

def read_env_files(env_path=".env"):
    env_dict = {}

    with open(env_path) as fp:
        for line in fp:
            line = line.strip()
            if len(line) == 0: continue
            key, value = line.split("=")
            env_dict[key] = value
    
    return env_dict
