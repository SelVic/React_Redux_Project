import React, {useEffect, useState, Fragment} from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Button from '@material-ui/core/Button';
import axios from "axios";
import TextField from "@material-ui/core/TextField";


const useRowStyles = makeStyles({
    root: {
        '& > *': {
            borderBottom: 'unset',
        },
    },
});





const Row = (props) => {
    const { row } = props;
    const [open, setOpen] = React.useState(false);
    const classes = useRowStyles();
    const [historyData, updateHistoryData] = useState([])
    const [rendered, updateRendered] = useState(false)

    const deleteHandler = (itemId, historyId, action, amount) => {
        const payLoad = {
            itemId: itemId,
            historyId: historyId,
            action: action,
            amount: amount,
        };
        axios({
            url: "/deleteHistory",
            method: "POST",
            data: payLoad
            })
            .then(()=>{
                console.log("История удалена");
            })
            .catch(()=>{
                console.log("Internal server error");
            })
        updateRendered(true)
    }


    useEffect(() => {
        updateRendered(false)
    })

    useEffect(() => {
        let cleanupFunc = false;
        const fetch = async () => {
            const responseHistory = await axios.get('/api/history')
            updateHistoryData(responseHistory.data.map(item => {
                return {uniqueId: item.uniqueId, action: item.action, amount: item.amount, date: item.date, historyId : item._id}
            }))
        }
        console.log("History data has been updated")
        fetch()
        return () => cleanupFunc = true;
    },[rendered]);

    const createHistoryArray = (id) => {
        let historyArray = historyData.filter(item => item.uniqueId == id)
        return historyArray
    }



    return (
        <React.Fragment>
            <TableRow className={classes.root}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.name}
                </TableCell>
                <TableCell align="right">{row.totalAmount}</TableCell>
                <TableCell align="right">{row.id}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom component="div">
                                История
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Дата</TableCell>
                                        <TableCell align="right">Количество</TableCell>
                                        <TableCell align="right">Добавлено / Удалено</TableCell>
                                        <TableCell align="right">Удалить историю</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {createHistoryArray(row.id).map((history) => (
                                        <TableRow key={history.historyId}>
                                            <TableCell component="th" scope="row">
                                                {history.date}
                                            </TableCell>
                                            <TableCell align="right">{history.amount}</TableCell>
                                            <TableCell align="right">{history.action}</TableCell>
                                            <TableCell align="right">
                                                <Button variant="contained" onClick={() => {deleteHandler(row.id, history.historyId, history.action, history.amount)}}>
                                                    Remove
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )).sort(()=> {return -1})}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

Row.propTypes = {
    row: PropTypes.shape({
        name: PropTypes.string,
        amount: PropTypes.number,
        id: PropTypes.string,
    }),
};


const BookTable = (props) => {
    const [mongoData, updateMongoData] = useState([]);
    const [filtered, updateFiltered] = useState(mongoData);
    const [text, updateText] = useState("")


    useEffect(() => {
        let cleanupFunc = false;
        const fetch = async () => {
            const response = await axios.get('/api')
            let responseValue = response.data;
            updateMongoData(responseValue.map(item => {
                return {name: item.name, id: item._id, totalAmount: item.totalAmount}
            }))
        }
        fetch()
        return () => cleanupFunc = true;
    },[]);


    return (
        <Fragment>
        <TextField id="standard-basic" label="Фильтр" type="text" value={text} onChange = {e => updateText(e.currentTarget.value)}/>
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Название предмета</TableCell>
                        <TableCell align="right">Количество на складе</TableCell>
                        <TableCell align="right">Идентификатор</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {mongoData.map((row) => (
                        <Row key={row._id} row={row} />
                    )).sort(()=> {return -1})}
                </TableBody>
            </Table>
        </TableContainer>
        </Fragment>
    );
}

export {BookTable}



