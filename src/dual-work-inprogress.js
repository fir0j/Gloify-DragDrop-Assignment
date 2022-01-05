<Grid item xs={8} sx={{ bgcolor: "primary.main" }}>
  <DragDropContext onDragEnd={onDragEnd}>
    {tasks.map((el, ind) => (
      <Droppable key={ind} droppableId={`${ind}`}>
        {(provided, snapshot) => (
          <Grid
            container
            sx={{
              borderTop: "1px solid",
              borderColor: "primary.main",
              bgcolor: snapshot.isDraggingOver ? "lightblue" : "lightgrey",
            }}
            justifyContent="space-between"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {el.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <Grid
                    item
                    xs={4}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      // some basic styles to make the items look a bit nicer
                      userSelect: "none",
                      padding: 8 * 2,
                      // margin: `0 0 8px 0`,

                      // change background colour if dragging
                      background: snapshot.isDragging ? "lightgreen" : "grey",

                      // styles we need to apply on draggables
                      ...provided.draggableProps.style,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        textAlign: "center",
                        bgcolor: "primary.dark",
                        color: "common.white",
                        borderRight: "1pt solid",
                        borderColor: "primary.main",
                      }}
                    >
                      {item.message}
                    </Typography>
                  </Grid>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Grid>
        )}
      </Droppable>
    ))}
  </DragDropContext>
</Grid>;
