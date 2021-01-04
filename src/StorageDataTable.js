import React, { Component } from "react";

export default class extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const messageNode = this.props.rows.map(row => {
      return (
        <tr key={row.key}>
          <td>{row.no}</td>
          <td>{row.name}</td>
          <td>{row.contentType}</td>
          <td>{row.size}</td>
          <td>
            <a target="_blank" href={row.url}>
              download
            </a>
          </td>
          <td>
            <a target="_blank" onClick={e => this.props.onDeleteItem(e, row)}>
              delete
            </a>
          </td>
          <td />
        </tr>
      );
    });

    return (
      <>
        <br />
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Content type</th>
              <th>size</th>
            </tr>
          </thead>
          <tbody>{messageNode}</tbody>
        </table>
      </>
    );
  }
}
