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
import EditIcon from "@mui/icons-material/Edit";
import ArrowRightAltSharpIcon from "@mui/icons-material/ArrowRightAltSharp";
import ArrowBackSharpIcon from "@mui/icons-material/ArrowBackSharp";
import { Alert, Col, Row, Space, Table } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import axios from "../api/axios";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import Header from "./Header";
import { Delete, Title } from "@mui/icons-material";
import DeleteModal from "../utils/Modals/DeleteModal";
import NestedModal from "../utils/Modals/anotherModal";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import LoadingBar from "react-top-loading-bar";
const Demo = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

const AllCases = () => {
  let { name } = useParams();
  const [dense, setDense] = React.useState(false);
  const [secondary, setSecondary] = React.useState(false);
  const [cases, setCases] = useState([]);
  const theme = name.replace(/%20/g, " ");
  const [showModel, setShowModel] = useState(false);
  const [deleteCaseIndex, setDeleteCaseIndex] = useState();
  const [recordChanged, setRecordChanged] = useState(false);
  const [itemName, setItemName] = useState("");
  const [progress, setProgress] = useState(30);
  const [showPage, setShowPage] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    axios.post("fetch_cases_by_theme/", { theme: theme }).then((res) => {
      setCases(res.data);
      setProgress(100);
      setShowPage(true);
    });
  }, [recordChanged, theme]);
  const handleDeleteCase = () => {
    let body = {
      theme: theme,
      caseName: cases[deleteCaseIndex]?.name,
    };
    axios.post("delete_case/", body).then((res) => {
      // console.log(res.data, "data");
      setRecordChanged(!recordChanged);
      setShowModel(false);
    });
  };
  function handleClick(event, link) {
    if (event.ctrlKey) {
      event.preventDefault(); // Prevents the default behavior of opening the link in the same tab
      window.open(link, "_blank"); // Opens the link in a new tab
    } else {
      if (link.includes("cases/")) {
        console.log(link.replace("cases/", ""), "replaced one");
        navigate(link.replace("cases/", ""));
      } else {
        navigate(link);
      }
    }
  }
  const tableData = cases?.map((elem, index) => {
    return {
      key: index,
      rowhead: index + 1,
      name: (
        <Link to={`edit/${elem?.name}`} style={{ textDecoration: 'none', color: 'inherit' }}><ListItem>
          <ListItemText
            className="linkOnHovar"
            // onClick={(event) => handleClick(event, `cases/edit/${elem?.name}`)}
            primary={elem.name}
            secondary={secondary ? "Secondary text" : null}
            sx={{ cursor: "pointer", textAlign: "left" }}
          />
        </ListItem></Link>
      ),
      gender: elem?.gender?.map((el, i) => {
        return el + `${elem?.gender[i + 1] ? ", " : ""}`;
      }),
      range: `${elem?.age_range?.min_age} - ${elem?.age_range?.max_age}`,
      categories: elem?.categories_fields?.map((el, i) => {
        return el + `${elem?.categories_fields[i + 1] ? ", " : ""}`;
      }),
      action: (
        <>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => navigate(`edit/${elem?.name}`)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => {
              setShowModel(true);
              setDeleteCaseIndex(index);
              setItemName(elem?.name);
            }}
          >
            <Delete />
          </IconButton>
        </>
      ),
    };
  });
  const showFile = (e) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      var safi = JSON.parse(e.target.result);
      let body = {
        topic: theme,
        caseName: safi.caseName,
        ageRange: [safi.min, safi.max],
        gender: safi.genderSelect,
        variables: safi.otherVariables,
        categoriesFields: safi.categoriesFields,
        questions: safi.question,
        questionCategoryValue: safi.questionCategoryValue,
        option: safi.answers,
        correctMultipleOptions: safi.correctMultipleOptions,
      };
      // console.log(body, "body");
      axios
        .post("save_case/", body)
        .then((res) => {
          // console.log(res.data, "status");
          setRecordChanged(!recordChanged);
          body = {};
        })
        .catch((err) => {
          console.log(err.data, "err");
        });
    };
    reader.readAsText(e.target.files[0]);
  };
  const dataSource = [
    {
      key: "1",
      name: "Mike",
      age: 32,
      address: "10 Downing Street",
    },
    {
      key: "2",
      name: "John",
      age: 42,
      address: "10 Downing Street",
    },
  ];

  const columns = [
    {
      title: "#",
      dataIndex: "rowhead",
      key: "rowhead",
      width: "5%",
      align: "center",
    },
    {
      title: "Case Name",
      dataIndex: "name",
      key: "name",
      align: "left",
      width: "20%",
    },
    // {
    //     title: 'Categories',
    //     dataIndex: 'categories',
    //     key: 'categories',
    //     align:'center',
    // },
    // {
    //     title: 'Gender',
    //     dataIndex: 'gender',
    //     key: 'gender',
    //     width:'20%',
    //     align:'center',
    // },
    {
      title: "Age Range",
      dataIndex: "range",
      key: "range",
      width: "20%",
      align: "left",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: "10%",
    },
  ];
  return (
    <>
      <LoadingBar
        color="#f11946"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      {showPage && (
        <main className="App">
          <NestedModal
            setShowModel={setShowModel}
            showModel={showModel}
            itemName={itemName}
            deleteFunction={handleDeleteCase}
            itemId={"3"}
            itemType={"case"}
          />
          <Header name="Automatic Item Generator v.4 (AIG-4)" />
          <Box sx={{ flexGrow: 1, maxWidth: "9" }}>
            <Grid container spacing={9}>
              <Grid item xs={12} md={12}>
                <Row className="mb-3 mt-4 d-lg-flex d-md-flex">
                  <Col flex={1} className="d-flex align-items-end">
                    <Breadcrumb>
                      <Breadcrumb.Item onClick={(event) => handleClick(event, '/')} style={{ fontSize: "1.2rem" }}>
                        <Link to={'/'} style={{ textDecoration: 'none', color: 'inherit' }}>
                          MCQs Generator
                        </Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item onClick={(event) => handleClick(event, '/themes')} style={{ fontSize: "1.2rem" }}>
                        <Link to={`/themes`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          Themes
                        </Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item
                        active
                        style={{ fontSize: "1.2rem", color: "black" }}
                      >
                        {theme}
                      </Breadcrumb.Item>
                    </Breadcrumb>
                  </Col>
                  <Col flex={1} className="text-lg-end text-md-end mt-lg-0 mt-md-0 mt-2">
                    <Typography
                      variant="h5"
                      component="div"
                    >
                      <Link to={`/${theme}/addcase`}>
                        <Button
                        sx={{
                          mt: 4,
                          backgroundColor: "lightgray",
                          color: "black",
                          cursor: "pointer",
                          borderRadius: "0.5rem",
                        }}
                        
                          color="success"
                          variant="contained"
                          component="label"
                          startIcon={<AddIcon />}
                          className="mb-0 add-btn"
                        >
                          Add Case
                        </Button>
                      </Link>
                    </Typography>
                  </Col>
                </Row>
                <Demo sx={{ borderRadius: 3 }}>
                  <Table
                    dataSource={tableData}
                    columns={columns}
                    pagination={{
                      showSizeChanger: true,
                      pageSizeOptions: ["5", "10", "20", "30"],
                      defaultPageSize: 10,
                      position: ["bottomCenter"],
                    }}
                  />
                </Demo>
              </Grid>
            </Grid>
          </Box>
        </main>
      )}
    </>
  );
};
export default AllCases;
