CC = gcc
CFLAGS = -O2 -Wall
LDFLAGS = `sdl2-config --cflags --libs`
SRC = overlay.c
OUT = shakeera-overlay

all: $(OUT)

$(OUT): $(SRC)
	$(CC) $(CFLAGS) $(SRC) -o $(OUT) $(LDFLAGS)

clean:
	rm -f $(OUT)