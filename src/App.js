import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
import "./App.css";
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
import Avatar from "@mui/material/Avatar";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Alert from "@mui/material/Alert";

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
    url: "https://devza.com/tests/tasks/create",
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

function formateDateAndTime(date) {
  let isodate = date.toISOString().substring(0, 10);
  let localTime = date.toLocaleTimeString().substring(0, 8);
  let dateAndTime = `${isodate} ${localTime}`;
  return dateAndTime;
}

function App() {
  const [{ users, isUsersLoading, isUsersError }, reFetchUsers] = useUsersApi(
    endpoints.listUsers
  );

  const [tasks, setTasks] = useState([]);
  const tasksClone = useRef([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isTasksError, setIsTasksError] = useState(false);

  const [edit, setEdit] = useState({ id: null, status: false, message: "" });
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteError, setIsDeleteError] = useState(false);
  const [isDeleteClicked, setIsDeleteClicked] = useState(null);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isSaveError, setIsSaveError] = useState(false);
  const inputRef = useRef();
  const messageRef = useRef("");
  const [startDate, setStartDate] = useState(new Date());
  const [radioValue, setRadioValue] = useState("1");
  const [userId, setUserId] = useState(null);
  const [isSumbitLoading, setIsSubmitLoading] = useState(false);
  const [isSumbitError, setIsSubmitError] = useState(false);
  const [selectedUser, setSelectedUser] = useState({ id: "1", name: "Aprit" });

  const fetchTasks = useCallback(() => {
    const fetchData = async () => {
      setIsTasksError(false);
      setIsTasksLoading(true);
      try {
        const result = await axios(endpoints.listTasks);
        const prioritizedTasks = getTasksByPriority(result.data.tasks);
        tasksClone.current = result.data.tasks;
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

  // setting default selected user
  useEffect(() => {
    if (users && users.length) {
      setSelectedUser(users[0]);
    }
  }, [users.length]);

  // assigning actual value to the Dom after re-render
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = edit.message;
    }
  }, [edit.status]);

  // or fetch tasks on each user change
  useEffect(() => {
    if (selectedUser.id === "0") return;
    const userTasks = tasksClone.current.filter(
      (item) => item.assigned_to === selectedUser.id
    );
    const prioritizedTasks = getTasksByPriority(userTasks);
    setTasks(prioritizedTasks);

    // console.log("prioritizedTasks", prioritizedTasks);
  }, [selectedUser.id, tasksClone.current.length]);

  async function onDragEnd(result) {
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

      // making the same changes in database as well.
      const sIndex = Number(source.droppableId);
      let targetItem = tasks[sIndex][source.index];
      const targetedPriority = `${Number(destination.droppableId) + 1}`;
      targetItem.priority = targetedPriority;
      // for moving item, just change the priority and update it.
      try {
        const result = await axios({
          ...endpoints.updateTask,
          data: new URLSearchParams({
            taskid: targetItem.id,
            priority: targetedPriority,
          }),
        });

        console.log("move response", result.data);
      } catch (err) {
        console.log("move error", err);
        await fetchTasks();
      }
    }
  }

  const handleMessageSave = (e, item) => {
    const fetchData = async () => {
      setIsSaveError(false);
      setIsSaveLoading(item.id);
      try {
        const result = await axios({
          ...endpoints.updateTask,
          data: new URLSearchParams({
            taskid: item.id,
            message: inputRef.current.value,
          }),
        });

        await fetchTasks();
        setIsSaveLoading(false);
        setEdit({ id: null, status: false, message: "" });
        console.log("update response", result.data);
      } catch (err) {
        console.log("update error", err);
        setIsSaveError(true);
      }
    };
    fetchData();
  };

  const handleAssignTask = (e, item) => {
    const fetchData = async () => {
      setIsSubmitError(false);
      setIsSubmitLoading(item.id);
      try {
        const result = await axios({
          ...endpoints.createTask,
          data: new URLSearchParams({
            taskid: item.id,
            message: messageRef.current,
            due_date: formateDateAndTime(startDate),
            priority: radioValue,
            assigned_to: userId,
          }),
        });

        await fetchTasks();
        setIsSubmitLoading(false);
        setUserId(null);
        console.log("create response", result.data);
      } catch (err) {
        setIsSubmitError(err);
        console.log("create error", err);
      }
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

  function getUserId() {
    if (selectedUser && selectedUser.id) {
      return selectedUser.id;
    }
    return "1";
  }

  const autocompleteSearch = useMemo(
    () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "4px",
        }}
      >
        <Autocomplete
          fullWidth
          freeSolo
          id="autocomplete search"
          // value={selectedUser}
          onChange={(e, newSelectedValue) => {
            if (newSelectedValue) {
              setSelectedUser(newSelectedValue);
            }
          }}
          onInputChange={(e) => {
            if (e === null || e.target.value === "") {
              return "";
            }
          }}
          // onKeyDown={handleEnterClick}

          sx={{
            height: ["35px", "35px", "35px"],
            "& input": {
              fontSize: "1.25rem",
              px: "1ch",
              bgcolor: "common.white",
              width: "100%",
              border: "none",
              borderTopLeftRadius: "4px",
              borderBottomLeftRadius: "4px",
              height: ["35px", "35px", "35px"],
              mb: 1,
              "&:focus": {
                outline: "none",
              },
            },
          }}
          renderInput={(params) => (
            <div ref={params.InputProps.ref}>
              <input type="search" {...params.inputProps} />
              {isUsersError && (
                <Box
                  sx={{
                    textJustify: "center",
                    color: "error.main",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <strong>
                    {isUsersError.message === "Network Error"
                      ? "No Internet !"
                      : isUsersError.message}
                  </strong>
                </Box>
              )}
            </div>
          )}
          options={users}
          getOptionLabel={(option) => option.name}
          // filterOptions={(x) => x}
          renderOption={(props, option, { inputValue }) => {
            const matches = match(option.name, inputValue);
            const parts = parse(option.name, matches);
            return (
              <li {...props}>
                <div>
                  {parts.map((part, index) => (
                    <span
                      key={index}
                      style={{
                        fontWeight: part.highlight ? 700 : 400,
                      }}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
              </li>
            );
          }}
        />
        <IconButton
          aria-label="search"
          sx={{
            bgcolor: "primary.main",
            width: ["46px", "46px", "54px"],
            height: ["35px", "35px", "35px"],
            maxHeight: "100%",
            minHeight: "0%",
            borderRadius: 0,
            borderTopRightRadius: (theme) => theme.shape.borderRadius,
            borderBottomRightRadius: (theme) => theme.shape.borderRadius,
            ":hover": {
              bgcolor: (theme) => theme.palette.secondary.main,
            },
          }}
        >
          <SearchIcon sx={{ fontSize: "1.5em", color: "common.black" }} />
        </IconButton>
      </Box>
    ),
    [users.length, isUsersLoading, isUsersError]
  );

  const taskform = (
    <Box component="form" sx={{ ml: 2 }}>
      <div>
        <Typography variant="body1">Message</Typography>
        <input
          required
          type="text"
          name="message"
          onChange={(e) => {
            messageRef.current = e.target.value;
          }}
        />
      </div>
      <div>
        <Typography variant="body1">Due date</Typography>
        <DatePicker
          required
          selected={startDate}
          onChange={(date) => setStartDate(date)}
        />
      </div>
      <div>
        <Typography variant="body1" component="label" sx={{ mr: 1 }}>
          Priority
        </Typography>
        <RadioGroup
          row
          aria-label="gender"
          name="controlled-radio-buttons-group"
          value={radioValue}
          onChange={(e) => setRadioValue(e.target.value)}
        >
          <FormControlLabel value="1" control={<Radio />} label="High" />
          <FormControlLabel value="2" control={<Radio />} label="Medium" />
          <FormControlLabel value="3" control={<Radio />} label="Low" />
        </RadioGroup>
      </div>
    </Box>
  );

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
                  sx={{
                    bgcolor: item.id === getUserId() ? "primary.dark" : "",
                    color: item.id === getUserId() ? "common.white" : "",
                  }}
                  secondaryAction={
                    userId === item.id ? (
                      <ListItemButton
                        sx={{
                          border: "1px solid",
                          borderColor:
                            item.id === getUserId() ? "common.white" : "green",
                        }}
                        onClick={(e) => {
                          setSelectedUser(item);
                          handleAssignTask(e, item);
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color:
                              item.id === getUserId()
                                ? "common.white"
                                : "green",
                            display: "flex",
                            alignContent: "center",
                          }}
                        >
                          {isSumbitLoading && userId === item.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            "Submit task"
                          )}
                        </Typography>
                      </ListItemButton>
                    ) : (
                      <ListItemButton
                        sx={{
                          border: "1px solid",
                          borderColor:
                            item.id === getUserId() ? "common.white" : "green",
                        }}
                        onClick={(e) => {
                          console.log("userid", item.id);
                          setSelectedUser(item);
                          setUserId(item.id);
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color:
                              item.id === getUserId()
                                ? "common.white"
                                : "green",
                          }}
                        >
                          Assign task
                        </Typography>
                        <AddCircleOutlinedIcon
                          sx={{
                            color:
                              item.id === getUserId()
                                ? "common.white"
                                : "green",
                            ml: 1,
                          }}
                        />
                      </ListItemButton>
                    )
                  }
                >
                  <ListItemButton
                    onClick={() => {
                      setSelectedUser(item);
                      setUserId(null);
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={`Avatar n°${item.id}`}
                        src=""
                        // src={`/static/images/avatar/${value + 1}.jpg`}
                      />
                    </ListItemAvatar>
                    <ListItemText id={labelId} primary={item.name} />
                  </ListItemButton>
                </ListItem>
                {userId === item.id ? taskform : null}
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
          {autocompleteSearch}
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
                  <input id={item.id} ref={inputRef} />
                </Typography>
                <Box sx={{ display: "flex" }}>
                  <IconButton
                    disabled={edit.status}
                    onClick={(e) => {
                      if (inputRef.current) {
                        inputRef.current.value = item.message;
                      }
                      setEdit({
                        id: item.id,
                        status: true,
                        message: item.message,
                      });
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    disabled={!edit.status && edit.id === item.id}
                    onClick={(e) => handleMessageSave(e, item)}
                  >
                    {isSaveLoading && item.id === isSaveLoading ? (
                      <CircularProgress size={20} />
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
                      <CircularProgress size={20} />
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
                    onClick={(e) => {
                      if (inputRef.current) {
                        inputRef.current.value = item.message;
                      }
                      setEdit({
                        id: item.id,
                        status: true,
                        message: item.message,
                      });
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    disabled={edit.status || edit.id !== item.id}
                    onClick={(e) => handleMessageSave(e, item)}
                  >
                    {isSaveLoading && item.id === isSaveLoading ? (
                      <CircularProgress size={20} />
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
                      <CircularProgress size={20} />
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

        {isUsersError ? (
          <Alert severity="error">{isUsersError.message}</Alert>
        ) : null}
        {isTasksError ? (
          <Alert severity="error">{isTasksError.message}</Alert>
        ) : null}
        {isSaveError ? (
          <Alert severity="error">{isSaveError.message}</Alert>
        ) : null}
        {isSumbitError ? (
          <Alert severity="error">{isSumbitError.message}</Alert>
        ) : null}
        {isDeleteError ? (
          <Alert severity="error">{isDeleteError.message}</Alert>
        ) : null}
        {isTasksLoading ? <LinearProgress /> : null}
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
