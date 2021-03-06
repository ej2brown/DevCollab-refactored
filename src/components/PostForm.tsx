import React, { useState } from "react"
import {
  Container,
  makeStyles,
  OutlinedInput,
  InputLabel,
  Button,
} from "@material-ui/core"
import Alert from "@material-ui/lab/Alert"
import axios from "axios"

const useStyles = makeStyles(theme => ({
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    ['@media (max-width:620px)']: {
      width: '75vw',
    },
    padding: '1em',
    borderRadius: '6px',
  },
  submit: {
    maxWidth: "310px",
    margin: '0 auto',
  },
  label: {
    margin: theme.spacing(0, 0, 1),
  },
}));

export default function PostForm(props: any) {
  const classes = useStyles();
  const [postState, setPostState] = useState({
    message: "",
    image: "",
  });

  const [error, setError] = useState(false);

  const onSubmitFunction = (event: any) => {
    setError(false)
    event.preventDefault()

    const groupId = props.group
    const session = JSON.parse(localStorage.getItem("session") || "{}")
    const userId = session.id
    const data = { userId, data: postState.message, image_url: postState.image }

    const checkData = (cb?: any) => {
      if (postState.message.includes("www.")) {
        var urlForAPI = postState.message
          .replace("http://", "")
          .replace("https://", "")
          .split(/[/?#]/)[0]
      }
      return axios
        .get(
          `https://api.linkpreview.net/?key=71de5c5e4e30482ea8aaee1b63be5b20&q=http://${urlForAPI}`
        )
        .then(res => {
          setPostState({ ...postState, image: res.data.image })
          data.image_url = res.data.image
          cb(postState)
          return postState
        })
        .catch(e => console.error("error in the api get request", e.stack))
    };

    if (data.data !== "") {
      checkData()?.then(() => {
        axios({
          method: "post",
          url: `https://dev-collabs-backend.herokuapp.com/group/${groupId}/post/create`,
          data: data,
        })
          .then(() => {
            props.postFunction(props.group)
            setPostState({
              ...postState, message: "",
              image: "",
            })

          })
          .catch(() => setError(true))
      })
    }
  }

  return (
    <Container component="main" className="dark">
      <form className={`${classes.form} ${"dark"}`} onSubmit={onSubmitFunction}>
        <InputLabel htmlFor="create-post" className={`${classes.label} ${"dark"}`}>
          CREATE POST
        </InputLabel>
        <OutlinedInput
          className="dark"
          id="create-post"
          placeholder="What's up?"
          fullWidth
          autoComplete="off"
          value={postState.message}
          onChange={e =>
            setPostState({ ...postState, message: e.target.value })
          }
        />
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="raised-button-file"
          multiple
          type="file"
          onChange={e => setPostState({ ...postState, image: e.target.value })}
        />
        <label htmlFor="raised-button-file">
          <Button component="span">Upload Image</Button>
        </label>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          className={classes.submit}
        >
          POST
        </Button>
      </form>
      {error && <Alert severity="error">Could Not Create Post</Alert>}
    </Container>
  )
}
