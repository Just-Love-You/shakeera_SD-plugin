#include <SDL2/SDL.h>
#include <signal.h>
#include <stdbool.h>
#include <stdio.h>

static bool running = true;

static void handle_sig(int sig)
{
  (void)sig;
  running = false;
}

static void log_line(const char *msg)
{
  fprintf(stdout, "[overlay] %s\n", msg);
  fflush(stdout);
}

int main(int argc, char **argv)
{
  (void)argc;
  (void)argv;

  signal(SIGTERM, handle_sig);
  signal(SIGINT, handle_sig);

  SDL_SetHint(SDL_HINT_VIDEO_X11_NET_WM_BYPASS_COMPOSITOR, "0");

  if (SDL_Init(SDL_INIT_VIDEO) != 0)
  {
    fprintf(stdout, "[overlay] SDL_Init failed: %s\n", SDL_GetError());
    fflush(stdout);
    return 1;
  }

  SDL_Window *win = SDL_CreateWindow(
      "shakeera-overlay",
      SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
      1280, 800,
      SDL_WINDOW_FULLSCREEN_DESKTOP | SDL_WINDOW_ALWAYS_ON_TOP);
  if (!win)
  {
    fprintf(stdout, "[overlay] SDL_CreateWindow failed: %s\n", SDL_GetError());
    fflush(stdout);
    SDL_Quit();
    return 1;
  }

  SDL_Renderer *ren = SDL_CreateRenderer(
      win, -1,
      SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
  if (!ren)
  {
    fprintf(stdout, "[overlay] SDL_CreateRenderer failed: %s\n", SDL_GetError());
    fflush(stdout);
    SDL_DestroyWindow(win);
    SDL_Quit();
    return 1;
  }

  SDL_SetRenderDrawBlendMode(ren, SDL_BLENDMODE_BLEND);

  int w = 0, h = 0;
  SDL_GetRendererOutputSize(ren, &w, &h);
  fprintf(stdout, "[overlay] started, size=%dx%d\n", w, h);
  fflush(stdout);

  while (running)
  {
    SDL_Event e;
    while (SDL_PollEvent(&e))
    {
      if (e.type == SDL_QUIT)
        running = false;
      if (e.type == SDL_KEYDOWN && e.key.keysym.sym == SDLK_q)
        running = false;
    }

    // background
    SDL_SetRenderDrawColor(ren, 10, 40, 10, 255);
    SDL_RenderClear(ren);

    // dots
    SDL_SetRenderDrawColor(ren, 220, 240, 255, 255);
    int cx = w / 2;
    int cy = h / 2;
    int r = 6;

    // log to cetre pos
    static bool logged = false;
    if (!logged)
    {
      fprintf(stdout, "[overlay] center at (%d,%d)\n", cx, cy);
      fflush(stdout);
      logged = true;
    }

    for (int dy = -r; dy <= r; dy++)
    {
      for (int dx = -r; dx <= r; dx++)
      {
        if (dx * dx + dy * dy <= r * r)
        {
          // top 3
          SDL_RenderDrawPoint(ren, cx - 200 + dx, cy - 200 + dy);
          SDL_RenderDrawPoint(ren, cx + dx, cy - 200 + dy);
          SDL_RenderDrawPoint(ren, cx + 200 + dx, cy - 200 + dy);
          
          // middle sides + edge offset
          SDL_RenderDrawPoint(ren, cx - 350 + dx, cy + dy);
          SDL_RenderDrawPoint(ren, cx + 350 + dx, cy + dy);
          
          // center
          SDL_RenderDrawPoint(ren, cx + dx, cy + dy);
          
          // bottom 3
          SDL_RenderDrawPoint(ren, cx - 200 + dx, cy + 200 + dy);
          SDL_RenderDrawPoint(ren, cx + dx, cy + 200 + dy);
          SDL_RenderDrawPoint(ren, cx + 200 + dx, cy + 200 + dy);
        }
      }
    }

    SDL_RenderPresent(ren);
    SDL_Delay(16);
  }

  fprintf(stdout, "[overlay] shutting down\n");
  fflush(stdout);

  SDL_DestroyRenderer(ren);
  SDL_DestroyWindow(win);
  SDL_Quit();
  return 0;
}