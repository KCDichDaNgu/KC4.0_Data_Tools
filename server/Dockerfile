FROM python:3.7
RUN apt-get update -y && apt-get install -y python3-pip
COPY . /app
WORKDIR /app
RUN pip3 install -r requirements.txt
CMD [ "python3", "./app.py" ]