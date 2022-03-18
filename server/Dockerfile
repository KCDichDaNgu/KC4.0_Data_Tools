FROM ubuntu:20.04
RUN apt-get update -y && apt-get install -y python3-pip
COPY . /app
WORKDIR /app
RUN pip3 install -i https://pypi.org/simple -r requirements.txt
CMD [ "python3", "./app.py" ]