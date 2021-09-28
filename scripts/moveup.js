moveUp = () => { 
    scrollBy(0, -10);
    if (scrollY > 0)
        setTimeout(moveUp, 1);
}