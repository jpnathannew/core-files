import axios from "axios";
import { getFromSessionStorage } from "../utilities/storage_utility";
import { APIErrorMsg } from "../constants/apiConstants";
class ApiService {
  constructor() {
    let service = axios.create({
      headers: {
        // csrf: 'token',
      },
    });
    service.interceptors.response.use(this.handleSuccess, this.handleError);
    this.service = service;
    this.currentUrl = "";
  }

  handleSuccess(response) {
    return response;
  }

  handleError = (error) => {
    const { status } = error.response || "";

    if (status === 401) {
      // todo : change this set up to event listeners
      if (this.currentUrl.indexOf("/login") < 0) {
        localStorage.clear();
        sessionStorage.clear();
        const event = new CustomEvent("session-expired", {
          detail: {
            message: "Your session has expired. Please login",
            actionButton: "OK",
            action: "go-to-login",
          },
        });
        window.dispatchEvent(event);
      }
      /* NOTE: if reason here is changed then session-expired handler in 
       APIErrorHandler also needs to be modified */
      return Promise.reject({
        status: "401",
        displayMessage:
          (error.response && error.response.data?.message) || APIErrorMsg,
      });
    }
    return Promise.reject(this.getFormattedError(error));
  };

  getFormattedError = (err) => {
    // todo: need to optimize this code after standardizing the API error response
    try {
      if (err.response && err.response.data) {
        if (err.response.data.error) {
          return {
            status: err.response.data.error.type,
            message: err.response.data.error.message,
          };
        } else if (err.response.data.message) {
          return {
            status: err.response.data,
            message: err.response.data.message,
          };
        }
      } else {
        if (err.status === "401") {
          return {
            status: "401",
            displayMessage: err.displayMessage,
          };
        }
        if (err !== "401") {
          return {
            status: "error",
            message: err.message,
            reference: err.status && err.status.reference,
            displayMessage:
              (err.status && err.status.displayMessage) || APIErrorMsg,
          };
        } else {
          return "401";
        }
      }
    } catch (e) {
      return { status: "error", message: "something went wrong" };
    }
  };

  get(path, params) {
    this.currentUrl = path;
    return this.service
      .request({
        method: "GET",
        url: path,
        params: params,
        headers: this.getHeader(),
      })
      .then((response) => response.data || response)
      .catch((e) => this.handleError(e));
  }

  put(path, payload, options = {}) {
    return this.service
      .request(this.getRequestObject("PUT", path, payload, options))
      .then((response) => response.data || response)
      .catch((e) => this.handleError(e));
  }

  patch(path, payload, options = {}) {
    return this.service
      .request(this.getRequestObject("PATCH", path, payload, options))
      .then((response) => response.data || response)
      .catch((e) => this.handleError(e));
  }

  post(path, payload, options = {}, contentType = null) {
    return this.service
      .request(
        this.getRequestObject("POST", path, payload, options, contentType)
      )
      .then((response) => response.data || response)
      .catch((e) => this.handleError(e));
  }

  getHeader = (contentType, options) => {
    if (contentType === "xml") {
      return {
        "Content-Type": "application/xml",
        Authorization: "bearer " + getFromSessionStorage("token"),
        clientId: "SFDC",
        loanNumber: options.loanNumber,
      };
    } else if (contentType === "multipart/form-data") {
      return {
        "Content-Type": "multipart/form-data",
        Authorization: "bearer " + getFromSessionStorage("token"),
      };
    } else {
      return {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: "bearer " + getFromSessionStorage("token"),
      };
    }
  };

  getRequestObject = (
    method,
    path,
    payload,
    options = {},
    contentType = null
  ) => {
    this.currentUrl = path;
    return {
      method: method,
      url: path,
      responseType: options.responseType || "json",
      data: payload,
      headers: this.getHeader(contentType, options),
    };
  };
}

export default new ApiService();