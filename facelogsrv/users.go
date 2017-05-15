package main

import (
	"crypto/rand"
	"encoding/csv"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	//	"io/ioutil"
	"net/http"
	"path/filepath"
)

func genTok() (string, error) {
	buf := make([]byte, 16)
	_, err := rand.Read(buf)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

// registration details
type RegDetails struct {
	// ipsos id...
	GE2017 string `json:"ge2017,omitempty"`
	// ...or...
	PostCode string `json:"postcode,omitempty"`
	Age      string `json:"age,omitempty"`
	Gender   string `json:"gender,omitempty"`
}

// response sent back for registration request
type RegReturn struct {
	Uniq string `json:"uniq,omitempty"`
	Err  string `json:"err,omitempty"`
}

// registration, record submitted values, hand out a unique token
func regHandler(w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}

	dec := json.NewDecoder(req.Body)
	var params RegDetails
	err := dec.Decode(&params)
	if err != nil {
		// TODO: send back error message via json
		fmt.Fprintf(os.Stderr, "ERR: %s\n", err)
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	// validate params here?

	//	fmt.Printf("params: %q\n", params)

	// TODO: VALIDATE GE2017 ID HERE!

	uniq, err := genTok()
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERR: %s\n", err)
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	// create user, dumpdir

	err = addUser(uniq, params)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERR: %s\n", err)
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	// NOTE: In future we might want to communicate an actual error message to the user
	ret := RegReturn{Uniq: uniq}

	enc := json.NewEncoder(w)
	_ = enc.Encode(ret)
}

func addUser(uniq string, d RegDetails) error {
	// create dir for new user
	dir := filepath.Join("data", uniq)

	err := os.MkdirAll(dir, 0700)
	if err != nil {
		return err
	}

	// add them to the list
	w, err := os.OpenFile("data/users.csv", os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0600)
	if err != nil {
		return err
	}

	defer w.Close()

	row := []string{uniq, d.GE2017, d.PostCode, d.Age, d.Gender}

	enc := csv.NewWriter(w)
	enc.Write(row)
	enc.Flush()

	fmt.Printf("New registration: %q\n", row)

	return nil
}
