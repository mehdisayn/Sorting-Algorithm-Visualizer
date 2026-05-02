import pygame
import random
pygame.init()
class DrawInformation:
    #this are just global color that we will use in our program
    BLACK = 0, 0, 0
    WHITE = 255, 255, 255
    RED = 255, 0, 0
    GREEN = 0, 255, 0
    GREY = 128, 128, 128
    BACKGROUND_COLOR = BLACK
    SIDE_PAD = 100
    TOP_PAD = 150
    GRADIENTS = [
        GREY,
        (160,160,160),
        (192,192,192)
    ]

    FONT = pygame.font.SysFont('comicsans', 20)
    LARGE_FONT = pygame.font.SysFont('comicsans', 40)

    def __init__(self,width, height, lst):
        self.width = width
        self.height = height
        self.window = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Sorting Algorithm VIS made by RRHIN")
        self.set_lst(lst)
    def set_lst(self, lst):
        self.lst = lst
        self.min_val = min(lst)
        self.max_val = max(lst)
        self.block_width = round((self.width - self.SIDE_PAD) / len(lst))
        self.block_height = (self.height -self.TOP_PAD) / (self.max_val - self.min_val)
        self.start_x = self.SIDE_PAD // 2

def draw(draw_info, color_positions={}):
    draw_info.window.fill(draw_info.BACKGROUND_COLOR)
    controls = draw_info.FONT.render("R - Reset | Space - Start Sorting  A - Ascending | D - Descending", 1, draw_info.RED)
    draw_info.window.blit(controls,(draw_info.width/2-controls.get_width()/2,5))
    sorting = draw_info.FONT.render("I - Insertion Sort | B - Bubble Sort", 1, draw_info.RED)
    draw_info.window.blit(sorting,(draw_info.width/2-sorting.get_width()/2,30))
    draw_list(draw_info, color_positions)
    pygame.display.update()

def draw_list(draw_info, color_positions={}):
    lst = draw_info.lst
    for i, val in enumerate(lst):
        x = draw_info.start_x + i * draw_info.block_width
        bar_height = (val - draw_info.min_val) * draw_info.block_height
        y = draw_info.height - bar_height
        color = draw_info.GRADIENTS[i % 3]
        if i in color_positions:
            color = color_positions[i]
        pygame.draw.rect(draw_info.window, color, (x, y, draw_info.block_width, bar_height))

def generate_starting_list(n, min_val, max_val):
    lst = []
    for _ in range(n):
        val = random.randint(min_val, max_val)
        lst.append(val)
    return lst

def bubble_sort(draw_info, ascending=True):
    lst = draw_info.lst
    for i in range(len(lst)-1):
        for j in range(len(lst)-1-i):
            num1 = lst[j]
            num2 = lst[j+1]
            if (num1>num2 and ascending) or (num1<num2 and not ascending):
                lst[j],lst[j+1] = lst[j+1], lst[j]
                draw(draw_info, {j: draw_info.GREEN, j+1: draw_info.RED})
                yield True
                #^- let's stop the function kinda like halfway & then resume it where-ever i put this line
    return lst

def main():
    run = True
    clock = pygame.time.Clock()
    n=50
    min_val = 0
    max_val =100
    lst = generate_starting_list(n,min_val,max_val)
    draw_info = DrawInformation(800,600,lst)
    sorting = False
    ascending = True
    sorting_algorithm = bubble_sort
    sorting_algo_name = "Bubble Sort"
    sorting_algo_gena = None
    while run:
        clock.tick(60)
        if sorting:
            try:
                next(sorting_algo_gena)
            except StopIteration:
                sorting = False
        else:
            draw(draw_info)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
            if event.type != pygame.KEYDOWN:
                continue
            if event.key == pygame.K_r:
                lst = generate_starting_list(n, min_val, max_val)
                draw_info.set_lst(lst)
                sorting = False
            elif event.key == pygame.K_SPACE and sorting == False:
                sorting = True
                sorting_algo_gena = sorting_algorithm(draw_info, ascending)
            elif event.key == pygame.K_a and not sorting:
                ascending = True
            elif event.key == pygame.K_d and not sorting:
                ascending = False

    pygame.quit()

if __name__ == "__main__":
    main()