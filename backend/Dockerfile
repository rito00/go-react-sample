FROM golang:1.22.5

WORKDIR /app

COPY . .

RUN go install github.com/air-verse/air@latest

RUN go mod tidy

RUN go build -o main .

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]