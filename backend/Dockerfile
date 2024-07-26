FROM golang:1.22.5

WORKDIR /app

COPY . .

RUN go install github.com/air-verse/air@latest

RUN go mod tidy

RUN go build -o main .

RUN chmod +x ./wait-for-it.sh

EXPOSE 8080

# MySQLの起動を待ってからairを実行
CMD ["sh", "-c", "./wait-for-it.sh db:3306 -t 60 -- air -c .air.toml"]