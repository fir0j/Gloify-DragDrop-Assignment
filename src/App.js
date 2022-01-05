import React, { useState, useEffect, useRef, useCallback } from "react";
import AppBar from "@mui/material/AppBar";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteForever";
import SaveIcon from "@mui/icons-material/Save";
import AssignmentIcon from "@mui/icons-material/Assessment";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { ThemeProvider, createTheme } from "@mui/material/styles";
// import logo from "./logo.svg";
import "./App.css";
import { styled } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import LinearProgress from "@mui/material/LinearProgress";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import axios from "axios";
import DualListDragDrop from "./DragDrop";
import CircularProgress from "@mui/material/CircularProgress";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function appBarLabel(label) {
  return (
    <Toolbar>
      <Typography
        variant="h5"
        noWrap
        component="div"
        sx={{ flexGrow: 1, textAlign: "center" }}
      >
        {label}
        <IconButton color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <AssignmentIcon />
        </IconButton>
      </Typography>
    </Toolbar>
  );
}

const darkTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    high: {
      main: "rgb(247, 71, 65)",
    },
    medium: {
      main: "rgb(158, 199, 57)",
    },
    low: {
      main: "rgb(247, 195, 21)",
    },
  },
});

// making custom hook
const useUsersApi = (options, initialData = []) => {
  const [users, setUsers] = useState(initialData);
  const [url, setUrl] = useState(options);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isUsersError, setIsUsersError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsUsersError(false);
      setIsUsersLoading(true);
      try {
        const result = await axios(url);
        setUsers(result.data.users);
      } catch (error) {
        setIsUsersError(true);
      }
      setIsUsersLoading(false);
    };
    fetchData();
  }, [url.method]);
  return [{ users, isUsersLoading, isUsersError }, setUrl];
};

const useListsApi = (options, initialData = []) => {
  const [lists, setLists] = useState(initialData);
  const [url, setUrl] = useState(options);
  const [isTasksLoading, setIsLoading] = useState(false);
  const [isTasksError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const result = await axios(url);
        console.log("length is", result.data.tasks.length);
        const prioritizedTasks = getTasksByPriority(result.data.tasks);
        setLists(prioritizedTasks);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [url.url]);
  return [{ lists, isTasksLoading, isTasksError }, setUrl];
};

const getTasksByPriority = (taskList) => {
  // let tasks = [
  //   {
  //     id: "400",
  //     message: "firoj1",
  //     assingned_to: "1",
  //     assignned_name: "Arpit",
  //     due_date: "2020-09-18 12:12:12",
  //     priority: "1",
  //   },
  //   {
  //     id: "401",
  //     message: "task2",
  //     assingned_to: "2",
  //     assignned_name: "Arpit",
  //     due_date: "2020-09-18 12:12:12",
  //     priority: "1",
  //   },
  //   {
  //     id: "403",
  //     message: "task3",
  //     assingned_to: "1",
  //     assignned_name: "Arpit",
  //     due_date: "2020-09-18 12:12:12",
  //     priority: "3",
  //   },
  //   {
  //     id: "404",
  //     message: "task4",
  //     assingned_to: "1",
  //     assignned_name: "Arpit",
  //     due_date: "2020-09-18 12:12:12",
  //     priority: "2",
  //   },
  //   {
  //     id: "405",
  //     message: "task5",
  //     assingned_to: "2",
  //     assignned_name: "Arpit",
  //     due_date: "2020-09-18 12:12:12",
  //     priority: "2",
  //   },
  //   {
  //     id: "406",
  //     message: "task6",
  //     assingned_to: "3",
  //     assignned_name: "Arpit",
  //     due_date: "2020-09-18 12:12:12",
  //     priority: "3",
  //   },
  //   {
  //     id: "407",
  //     message: "task7",
  //     assingned_to: "4",
  //     assignned_name: "Arpit",
  //     due_date: "2020-09-18 12:12:12",
  //     priority: "3",
  //   },
  // ];
  if (taskList === null || taskList === undefined) return [];
  let High = taskList.filter((item) => Number(item.priority) === 1);
  let Medium = taskList.filter((item) => Number(item.priority) === 2);
  let Low = taskList.filter((item) => Number(item.priority) === 3);
  return [High, Medium, Low];
};

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const clonedList = [...list];
  // splice(startindex,numberofitemstobedeleted)
  const [removed] = clonedList.splice(startIndex, 1);
  // splice(insert,donotdelete,insertwith)
  clonedList.splice(endIndex, 0, removed);

  return clonedList;
};

// Moves an item from one list to another list.

const move = (source, destination, droppableSource, droppableDestination) => {
  // droppableSourceIndex is an index of item in source array.
  // droppableDestinationIndex is an index of item in destination array.
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  // removing one element from source array(droppable)
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  // changing priority of moved items before inserting into new array
  let destinationDroppable = Number(droppableDestination.droppableId) + 1;
  removed.priority = `${destinationDroppable}`;

  // inserting the item into destination array(droppable)
  destClone.splice(droppableDestination.index, 0, removed);

  // packing multiple arrays into one array.
  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const getItemColor = (priority) => {
  if (priority === "1") return "high.main";
  if (priority === "2") return "medium.main";
  if (priority === "3") return "low.main";
  return "gray";
};

const endpoints = {
  listUsers: {
    method: "GET",
    url: "https://devza.com/tests/tasks/listusers",
    headers: {
      AuthToken: "UrM4YHgb1FcqEf1tuKwmAMMX5MxFZ12a",
    },
  },
  listTasks: {
    method: "GET",
    url: "https://devza.com/tests/tasks/list",
    headers: {
      AuthToken: "UrM4YHgb1FcqEf1tuKwmAMMX5MxFZ12a",
    },
  },
  createTask: {
    method: "POST",
    url: "https://devza.com/tests/tasks/update",
    headers: {
      AuthToken: "UrM4YHgb1FcqEf1tuKwmAMMX5MxFZ12a",
    },
  },
  updateTask: {
    method: "POST",
    url: "https://devza.com/tests/tasks/update",
    headers: {
      AuthToken: "UrM4YHgb1FcqEf1tuKwmAMMX5MxFZ12a",
    },
  },
  deleteTask: {
    method: "POST",
    url: "https://devza.com/tests/tasks/delete",
    headers: {
      AuthToken: "UrM4YHgb1FcqEf1tuKwmAMMX5MxFZ12a",
    },
  },
};

function App() {
  const [{ users, isUsersLoading, isUsersError }, reFetchUsers] = useUsersApi(
    endpoints.listUsers
  );

  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isTasksError, setIsTasksError] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [edit, setEdit] = useState({ id: null, status: false });
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteError, setIsDeleteError] = useState(false);
  const [isDeleteClicked, setIsDeleteClicked] = useState(null);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isSaveError, setIsSaveError] = useState(false);
  const [isSaveClicked, setIsSaveClicked] = useState(null);

  const fetchTasks = useCallback(() => {
    const fetchData = async () => {
      setIsTasksError(false);
      setIsTasksLoading(true);
      try {
        const result = await axios(endpoints.listTasks);
        console.log("length is", result.data.tasks.length);
        const prioritizedTasks = getTasksByPriority(result.data.tasks);
        setTasks(prioritizedTasks);
      } catch (err) {
        console.log("list users error", err);
        setIsTasksError(true);
      }
      setIsTasksLoading(false);
    };
    fetchData();
  }, []);

  // fetching tasks
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  function onDragEnd(result) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const sInd = source.droppableId;
    const dInd = destination.droppableId;

    if (sInd === dInd) {
      // console.log("when reordered in same droppableId", sInd, dInd);
      // note state[sInd] returnss array in source droppbale
      const items = reorder(tasks[sInd], source.index, destination.index);
      const newState = [...tasks];
      // mutating replace source droppable array with new newly ordered array
      newState[sInd] = items;
      setTasks(newState);
    } else {
      // console.log("when moved between different droppableId", sInd, dInd);
      let from = tasks[sInd];
      let to = tasks[dInd];
      const result = move(from, to, source, destination);
      const newState = [...tasks];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];
      setTasks(newState);
      // filtering out empty array if exists.
      // setTasks(newState.filter((group) => group.length));
    }
  }

  const handleMessageEdit = (e) => {
    console.log(e.target.value);
    // messageRef.current = e.target.value;
    // console.log("messageRef.current", messageRef.current);
  };

  const handleMessageUpdate = (e, item) => {
    setEdit({ id: null, status: false });
    console.log(e.target.value);
    const fetchData = async () => {
      setIsSaveError(false);
      setIsSaveLoading(item.id);
      try {
        const result = await axios({
          ...endpoints.updateTask,
          data: new URLSearchParams({
            taskid: item.id,
            message: e.target.value,
          }),
        });

        await fetchTasks();
        console.log("update response", result.data);
      } catch (err) {
        console.log("update error", err);
        setIsSaveError(true);
      }
      setIsSaveLoading(false);
    };
    fetchData();
  };

  const handleDelete = (e, item) => {
    const fetchData = async () => {
      setIsDeleteError(false);
      setIsDeleteLoading(true);
      try {
        const result = await axios({
          ...endpoints.deleteTask,
          data: new URLSearchParams({ taskid: item.id }),
        });

        await fetchTasks();
        console.log("delete response", result.data);
      } catch (err) {
        console.log("delete error", err);
        setIsDeleteError(true);
      }
      setIsDeleteLoading(false);
    };
    fetchData();
  };

  const usersList = (
    <List
      dense
      sx={{ width: "100%", maxWidth: "100%", bgcolor: "primary.main" }}
    >
      {users && users.length
        ? users.map((item) => {
            const labelId = `checkbox-list-secondary-label-${item.name}`;
            return (
              <Paper
                sx={{
                  mx: 1,
                  // my: "1px",
                  borderRadius: "0px",
                }}
                key={item.id}
              >
                <ListItem
                  // onMouseOver={() => console.log(item)}
                  secondaryAction={
                    <AddCircleOutlinedIcon sx={{ color: "green" }} />
                  }
                >
                  <ListItemButton>
                    <ListItemAvatar>
                      <Avatar
                        alt={`Avatar n°${item.id}`}
                        // src={`/static/images/avatar/${value + 1}.jpg`}
                      />
                    </ListItemAvatar>
                    <ListItemText id={labelId} primary={item.name} />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </Paper>
            );
          })
        : null}
    </List>
  );

  const appHeader = (
    <Grid container rowSpacing={1}>
      <Grid item xs={4}>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            bgcolor: "primary.dark",
            p: 1,
            color: "common.white",
            borderRight: "1px solid",
            borderColor: "primary.main",
          }}
        >
          Users
        </Typography>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            bgcolor: "primary.dark",
            p: 1,
            color: "common.white",
            borderRight: "1px solid",
            borderTop: "1px solid",
            borderColor: "primary.main",
          }}
        >
          {/* {autocompleteSearch} */}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            bgcolor: "primary.dark",
            p: 1,
            color: "common.white",
          }}
        >
          Task & Priority
        </Typography>
        <Grid
          container
          sx={{ borderTop: "1px solid", borderColor: "primary.main" }}
          justifyContent="space-between"
        >
          <Grid item xs={4}>
            <Typography
              sx={{
                textAlign: "center",
                bgcolor: "primary.dark",
                p: 1,
                pb: 1.4,
                color: "high.main",
                borderRight: "1pt solid",
                borderColor: "primary.main",
              }}
              variant="h6"
            >
              High
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography
              sx={{
                textAlign: "center",
                bgcolor: "primary.dark",
                p: 1,
                pb: 1.4,
                color: "medium.main",
                borderRight: "1pt solid",
                borderColor: "primary.main",
              }}
              variant="h6"
            >
              Medium
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography
              sx={{
                textAlign: "center",
                bgcolor: "primary.dark",
                p: 1,
                pb: 1.4,
                color: "low.main",
              }}
              variant="h6"
            >
              Low
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const draggable = (el) =>
    el.map((item, index) => (
      <Draggable key={item.id} draggableId={item.id} index={index}>
        {(provided, snapshot) => {
          if (edit.status && edit.id === item.id) {
            return (
              <Stack
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                sx={{
                  // some basic styles to make the items look a bit nicer
                  userSelect: "none",
                  padding: 2,
                  // margin: `0 0 8px 0`,
                  mb: 1,
                  textAlign: "left",

                  // change background colour if dragging
                  bgcolor: snapshot.isDragging
                    ? "lightgreen"
                    : getItemColor(item.priority),
                  // styles we need to apply on draggables
                  ...provided.draggableProps.style,
                }}
                style={{ cursor: "move" }}
              >
                <Typography variant="overline" sx={{ color: "grey.900" }}>
                  Due date:{" "}
                  <Box component="span" sx={{ color: "grey.700" }}>
                    {item.due_date}
                  </Box>
                </Typography>
                <Typography variant="h6">
                  <input
                    id={item.id}
                    value={item.message}
                    onChange={handleMessageEdit}
                  />
                </Typography>
                <Box sx={{ display: "flex" }}>
                  <IconButton
                    disabled={edit.status}
                    onClick={() => {
                      setEdit({ id: item.id, status: true });
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    disabled={!edit.status && edit.id === item.id}
                    onClick={(e) => handleMessageUpdate(e, item)}
                  >
                    {isSaveLoading && item.id === isSaveLoading ? (
                      <CircularProgress />
                    ) : (
                      <SaveIcon />
                    )}
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      setIsDeleteClicked(item.id);
                      handleDelete(e, item);
                    }}
                  >
                    {isDeleteLoading && item.id === isDeleteClicked ? (
                      <CircularProgress />
                    ) : (
                      <DeleteIcon />
                    )}
                  </IconButton>
                </Box>
              </Stack>
            );
          } else {
            return (
              <Stack
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                sx={{
                  // some basic styles to make the items look a bit nicer
                  userSelect: "none",
                  padding: 2,
                  // margin: `0 0 8px 0`,
                  mb: 1,
                  textAlign: "left",

                  // change background colour if dragging
                  bgcolor: snapshot.isDragging
                    ? "lightgreen"
                    : getItemColor(item.priority),
                  // styles we need to apply on draggables
                  ...provided.draggableProps.style,
                }}
                style={{ cursor: "move" }}
              >
                <Typography variant="overline" sx={{ color: "grey.900" }}>
                  Due date:{" "}
                  <Box component="span" sx={{ color: "grey.700" }}>
                    {item.due_date}
                  </Box>
                </Typography>
                <Typography variant="h6">{item.message}</Typography>
                <Box sx={{ display: "flex" }}>
                  <IconButton
                    disabled={edit.status}
                    onClick={() => setEdit({ id: item.id, status: true })}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    disabled={edit.status || edit.id !== item.id}
                    onClick={(e) => handleMessageUpdate(e, item)}
                  >
                    {isSaveLoading && item.id === isSaveLoading ? (
                      <CircularProgress />
                    ) : (
                      <SaveIcon />
                    )}
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      setIsDeleteClicked(item.id);
                      handleDelete(e, item);
                    }}
                  >
                    {isDeleteLoading && item.id === isDeleteClicked ? (
                      <CircularProgress />
                    ) : (
                      <DeleteIcon />
                    )}
                  </IconButton>
                </Box>
              </Stack>
            );
          }
        }}
      </Draggable>
    ));

  const dragAndDropList = tasks.map((el, ind) => (
    <Droppable key={ind} droppableId={`${ind}`}>
      {(provided, snapshot) => (
        <Grid
          item
          xs={4}
          ref={provided.innerRef}
          sx={{
            bgcolor: snapshot.isDraggingOver ? "primary.dark" : "primary.main",
            padding: 1,
            width: 250,
            marginTop: 1,
            userSelect: "none",
          }}
          {...provided.droppableProps}
        >
          {draggable(el)}
          {provided.placeholder}
        </Grid>
      )}
    </Droppable>
  ));

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <ThemeProvider theme={darkTheme}>
        <AppBar position="static" color="primary">
          {appBarLabel("Mini Task Manager")}
        </AppBar>
        {appHeader}

        <Grid container>
          <Grid item xs={4} sx={{ bgcolor: "primary.main" }}>
            {usersList}
          </Grid>

          <DragDropContext onDragEnd={onDragEnd}>
            <Grid item container xs={8} sx={{ bgcolor: "primary.main" }}>
              {dragAndDropList}
            </Grid>
          </DragDropContext>
        </Grid>
      </ThemeProvider>
    </Stack>
  );
}

export default App;
