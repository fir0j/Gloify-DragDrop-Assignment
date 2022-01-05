import React, { useState } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`,
  }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};
const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle,
});
const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 250,
});

function DualListDragDrop({ tasks }) {
  const [state, setState] = useState(tasks);
  //   console.log(state);

  function onDragEnd({ source, destination }) {
    // dropped outside the list
    if (!destination) {
      return;
    }

    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      setState(newState.filter((group) => group.length));
    }
  }

  return (
    <div>
      {/* <button
        type="button"
        onClick={() => {
          setState([...state, []]);
        }}
      >
        Add new group
      </button>
      <button
        type="button"
        onClick={() => {
          setState([...state, getItems(1)]);
        }}
      >
        Add new item
      </button> */}
      <div style={{ display: "flex" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <Droppable key={ind} droppableId={`${ind}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >
                  {el.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-around",
                            }}
                          >
                            {item.message}
                            <button
                              type="button"
                              onClick={() => {
                                const newState = [...state];
                                newState[ind].splice(index, 1);
                                setState(
                                  newState.filter((group) => group.length)
                                );
                              }}
                            >
                              delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}

export default DualListDragDrop;

// const getTaskByPriority = (priority) => {
//   if (tasks === null || tasks === undefined) return [];
//   const result = tasks.filter((item) => Number(item.priority) === priority);
//   return (
//     <List
//       dense
//       sx={{ width: "100%", maxWidth: "100%", bgcolor: "primary.main" }}
//     >
//       {result.map((item) => {
//         const labelId = `checkbox-list-secondary-label-${item.message}`;
//         return (
//           <Paper
//             sx={{
//               mx: 1,
//               my: "2px",
//               borderRadius: "4px",
//               bgcolor:
//                 Number(priority) === 1
//                   ? "high.main"
//                   : Number(priority) === 2
//                   ? "medium.main"
//                   : "low.main",
//             }}
//             key={item.id}
//           >
//             <ListItem>
//               <Stack>
//                 <Box>
//                   <Typography
//                     variant="overline"
//                     sx={{ textTransform: "none" }}
//                   >
//                     <Box component="span" sx={{ color: "grey.700" }}>
//                       Due date:{" "}
//                     </Box>
//                     {item.due_date}
//                   </Typography>
//                 </Box>
//                 <Divider sx={{ width: "100%" }} />
//                 <Box>
//                   <Typography sx={{ py: 1 }} variant="body2">
//                     {item.message}
//                   </Typography>
//                   <Box>
//                     <IconButton>
//                       <EditIcon sx={{ color: "grey.700" }} />
//                     </IconButton>
//                     <IconButton>
//                       <SaveIcon sx={{ color: "grey.700" }} />
//                     </IconButton>
//                     <IconButton>
//                       <DeleteIcon sx={{ color: "grey.700" }} />
//                     </IconButton>
//                   </Box>
//                 </Box>
//               </Stack>
//             </ListItem>
//             <Divider />
//           </Paper>
//         );
//       })}
//     </List>
//   );
// };
