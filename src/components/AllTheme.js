import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import LabelIcon from "@mui/icons-material/Label";
import Delete from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowRightAltSharpIcon from "@mui/icons-material/ArrowRightAltSharp";
import ArrowBackSharpIcon from "@mui/icons-material/ArrowBackSharp";
import { Col, Row, Table } from "antd";
import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../api/axios";
import { useEffect } from "react";
import Header from "./Header";
import AddTheme from "../utils/Modals/AddTheme";
import AddIcon from "@mui/icons-material/Add";
import NestedModal from "../utils/Modals/anotherModal";
import EditThemeName from "../utils/Modals/EditThemeName";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import LoadingBar from 'react-top-loading-bar'
import { saveAs } from 'file-saver';
const Demo = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

const AllTheme = () => {
  const [dense, setDense] = React.useState(false);
  const [secondary, setSecondary] = React.useState(false);
  const [themes, setThemes] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [themeName, setThemeName] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [editError, setEditError] = useState("");
  const [themeId, setThemeId] = useState("");
  const [showEditThemeNameModal, setShowEditThemeNameModal] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});
  const [progress, setProgress] = useState(30);
  const [showPage, setShowPage] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    axios.get("fetch_themes/").then((res) => {
      setThemes(res.data);
      setProgress(100);
      setShowPage(true);
    });
  }, [refresh]);
  const handleDeleteCase = () => {
    let body = {
      theme: itemName,
    };
    axios.post("delete_theme/", body).then((res) => {
      // console.log(res.data, "data");
      setRefresh(!refresh);
      setShowModel(false);
    });
  };
  const DownloadTheme = (theme) => {
    axios
      .post("download_theme/", { theme })
      .then((res) => {
        console.log(res.data)
        let body = {
          themeName: theme,
          casesData: res.data
        }
        if (res?.data?.length !== 0) {
          const blob = new Blob([JSON.stringify(body)], { type: 'application/js' });
          saveAs(blob, `${theme}.json`);
        }
      })
      .catch((err) => {
      });

  }
  function isNameExist(name) {
    for (let i = 0; i < Object.values(themes)?.length; i++) {
      if (Object.values(themes)[0][i]?.name?.name === name) {
        return true; // Name exists
      }
    }
    return false; // Name does not exist
  }
  const handleEditTheme = () => {
    setEditError(false);
    axios
      .post("edit_theme/", { id: themeId, themeName: themeName })
      .then((res) => {
        if (res.data?.status === 200) {
          setShowEditThemeNameModal(!showEditThemeNameModal);
          setRefresh(!refresh);
        } else if (res.data?.status === 400) {
          setEditError(true);
        }
      })
      .catch((err) => {
        setShowEditThemeNameModal(!showEditThemeNameModal);
      });
  };
  const showFile = (e) => {
    const reader = new FileReader();
    console.log(e, 'e')
    reader.onload = (e) => {
      var safi = JSON.parse(e.target.result);
      console.log(safi, 'safi')
      let casesData = safi?.casesData
      for (let j = 0; j < casesData?.length; j++) {
        let listOfVariables = {};
        let other_variables_list = casesData[j].data["other_variables_list"]
        for (let i = 0; i < Object.keys(other_variables_list)?.length; i++) {
          let item =
            (Object.keys(other_variables_list)[i] || "")
              .trim()
              .match(/\([a-z0-9_-]+\)/gi)?.[0] || "";
          listOfVariables[item.slice(1, item.length - 1)] =
            Object.values(other_variables_list)[i];
        }
        casesData[j].data["ageRange"]=[casesData[j].data["age_range"]["min_age"],casesData[j].data["age_range"]["max_age"]]
        casesData[j].data["categoriesFields"]=casesData[j].data["categories_fields"]
        casesData[j].data["correctMultipleOptions"]=casesData[j].data["correct_multiple_options"]
        casesData[j].data["option"]=casesData[j].data["distract_multiple_options"]
        casesData[j].data["questionCategoryValue"]=casesData[j].data["question_category_values"]
        casesData[j].data["variables"] = listOfVariables
        delete casesData[j].data.age_range;
        delete casesData[j].data.categories_fields;
        delete casesData[j].data.correct_multiple_options;
        delete casesData[j].data.question_category_values;
        delete casesData[j].data.distract_multiple_options;
        delete casesData[j].data.other_variables_list;
      }
      console.log(casesData, 'casesData')
      let body = {
        themeName: `${safi?.themeName} copy`,
        casesData: casesData
      }
      axios
        .post("import_theme/", body)
        .then((res) => {
          console.log(res.data)
          setRefresh(!refresh)
        })
        .catch((err) => {
        });
    };
    reader.readAsText(e.target.files[0]);
  };
  const tableData = themes["themes"]?.map((elem, index) => {
    return {
      key: index,
      rowhead: index + 1,
      id: elem.name.id,
      name: (
        <Link to={`/${elem.name.name}/cases`} style={{ textDecoration: 'none', color: 'inherit' }}><ListItem>
          <ListItemText
            className="linkOnHovar"
            primary={elem.name.name}
            secondary={secondary ? "Secondary text" : null}
            sx={{ cursor: "pointer", textAlign: "left" }}
          />
        </ListItem></Link>
      ),
      no: elem.noOfCases,
      action: (
        <>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => {
              setShowEditThemeNameModal(true);
              setThemeName(elem?.name?.name);
              setThemeId(elem?.name?.id);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => {
              setShowModel(true);
              setItemName(elem?.name?.name);
            }}
          >
            <Delete />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => DownloadTheme(elem?.name.name)}
          >
            <DownloadIcon />
          </IconButton>
        </>
      ),
    };
  });
  const columns = [
    {
      title: "#",
      dataIndex: "rowhead",
      key: "rowhead",
      width: "10%",
      align: "center",
    },
    {
      title: "Theme Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      align: "left",
    },
    // {
    //     title: 'id',
    //     dataIndex: 'id',
    //     key: 'id',
    //     width: '20%',
    //     align: 'center',
    // },
    {
      title: "No of Cases",
      dataIndex: "no",
      key: "no",
      width: "20%",
      align: "left",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "10%",
      align: "left",
    },
  ];
  function handleClick(event, link) {
    if (event.ctrlKey) {
      event.preventDefault(); // Prevents the default behavior of opening the link in the same tab
      window.open(link, "_blank"); // Opens the link in a new tab
    } else {
      navigate(link);
    }
  }
  return (
    <>
      <LoadingBar
        color="#f11946"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      {showPage && (
        <main className="App">
          <Header name="Automatic Item Generator v.4 (AIG-4)" />
          <AddTheme
            refresh={refresh}
            setRefresh={setRefresh}
            showModal={showModal}
            setShowModal={setShowModal}
          />
          <EditThemeName
            setShowModal={setShowEditThemeNameModal}
            showModal={showEditThemeNameModal}
            refresh={refresh}
            setRefresh={setRefresh}
            themeName={themeName}
            setThemeName={setThemeName}
            handleEditTheme={handleEditTheme}
            error={editError}
          />
          <NestedModal
            setShowModel={setShowModel}
            showModel={showModel}
            itemName={itemName}
            deleteFunction={handleDeleteCase}
            itemId={"3"}
            itemType={"case"}
          />
          <Box sx={{ flexGrow: 1, maxWidth: "9" }}>
            <Grid container spacing={9}>
              <Grid item xs={12} md={12}>
                <Row className="mb-3 mt-4 d-lg-flex d-md-flex">
                  <Col flex={1} className="d-flex align-items-end">
                    {/* <Typography
                  sx={{ mt: 4, mb: 2, float: "left", cursor: "pointer" }}
                  variant="h5"
                  component="div"
                  onClick={() => navigate("/")}
                >
                  <ArrowBackSharpIcon fontSize="small" /> Generate MCQs
                </Typography> */}
                    <Breadcrumb>

                      <Breadcrumb.Item onClick={(event) => handleClick(event, "/")} style={{ fontSize: "1.2rem" }}>
                        <Link to={`/`} style={{ textDecoration: 'none', color: 'inherit' }}>MCQs Generator</Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item
                        active
                        style={{ fontSize: "1.2rem", color: "black" }}
                      >
                        Themes
                      </Breadcrumb.Item>
                    </Breadcrumb>
                  </Col>
                  <Col flex={1} className="text-lg-end text-md-end mt-lg-0 mt-md-0 mt-2">
                    <Button
                      className="mb-0 add-btn me-1"
                      onClick={() => setShowModal(!showModal)}
                      sx={{
                        backgroundColor: "lightgray",
                        color: "black",
                        cursor: "pointer",
                        borderRadius: "0.5rem",
                      }}
                      variant="contained"
                      color="success"
                      component="label"
                      startIcon={<AddIcon />}
                      id="add-theme"
                    >
                      Add Theme
                    </Button>
                    <Button
                      className="mb-0 add-btn"
                      sx={{
                        backgroundColor: "lightgray",
                        color: "black",
                        cursor: "pointer",
                        borderRadius: "0.5rem",
                      }}
                      variant="contained"
                      color="success"
                      component="label"
                      id="add-theme"
                    >
                      IMPORT THEME
                      <input
                        id="files"
                        style={{ visibility: "hidden", display: "none" }}
                        type="file"
                        onChange={(e) => showFile(e)}
                      />
                    </Button>
                  </Col>
                </Row>
                <Demo sx={{ borderRadius: 3 }}>
                  <div>
                    <Table
                      dataSource={tableData}
                      columns={columns}
                      size="medium"
                      pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ["5", "10", "20", "30"],
                        defaultPageSize: 5,
                        position: ["bottomCenter"],
                      }}
                    />
                    ;
                  </div>
                  {/* <List dense={dense}>
                                {themes['themes']?.map((elem, index) => {
                                    return (
                                        <div key={index}>
                                            <ListItem
                                                secondaryAction={
                                                    <IconButton edge="end" aria-label="delete" onClick={() => { setShowModel(true); setItemName(elem?.name) }}>
                                                        <Delete />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText
                                                    onClick={() => navigate(`/${elem.name}/cases`)}
                                                    primary={elem.name}
                                                    secondary={secondary ? 'Secondary text' : null}
                                                    sx={{ cursor: "pointer" }}
                                                />
                                            </ListItem>
                                        </div>
                                    )
                                })}
                            </List> */}
                </Demo>
              </Grid>
            </Grid>
          </Box>
        </main>
      )}
    </>
  );
};
export default AllTheme;
