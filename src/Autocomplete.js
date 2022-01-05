const autocompleteSearch = useMemo(
  () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        // height: "inherit",
        // boxShadow: "0 0 0 2px #fb6a02, 0  0  0 3px rgba(255, 153, 0, 0.5) ",
        borderRadius: "4px",
      }}
    >
      <Autocomplete
        fullWidth
        freeSolo
        id="autocomplete search"
        // value={selectedValue}
        // onChange={(e, newSelectedValue) =>
        //   handleSuggestionClick(e, newSelectedValue)
        // }
        // onInputChange={handleInputChange}
        // onKeyDown={handleEnterClick}
        // onOpen={() => {
        //   setBackdrop(true);
        // }}
        // onClose={() => setBackdrop(false)}
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
            // color: (theme) =>
            // theme.palette.getContrastText(theme.palette.background.paper),
            "&:focus": {
              outline: "none",
            },
          },
        }}
        renderInput={(params) => (
          <div ref={params.InputProps.ref}>
            <input type="search" {...params.inputProps} />
            {isUsersLoading && (
              <LinearProgress
                aria-describedby="loading"
                aria-busy="true"
                color="secondary"
                sx={{ height: "4px", width: "100%", zIndex: 1500 }}
              />
            )}
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
                  {isUsersError.message == "Network Error"
                    ? "No Internet !"
                    : isUsersError.message}
                </strong>
              </Box>
            )}
          </div>
        )}
        options={users}
        getOptionLabel={(option) => option.name}
        filterOptions={(x) => x}
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
  []
);
