package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	//	"io/ioutil"
	"net/http"
)

func genTok() (string, error) {
	buf := make([]byte, 16)
	_, err := rand.Read(buf)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}

// incoming registration request
type RegReq struct {
	// ipsos id...
	IpsosMORI string `json:"ipsosmori,omitempty"`
	// ...or...
	Country  string `json:"country,omitempty"`
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
	var params RegReq
	err := dec.Decode(&params)
	if err != nil {
		// TODO: send back error message via json
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	// validate params here?

	fmt.Printf("params: %q\n", params)

	// TODO: VALIDATE IPSOSMORI ID HERE!

	uniq, err := genTok()
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	// create user, dumpdir

	// NOTE: In future we might want to communicate an actual error message to the user
	ret := RegReturn{Uniq: uniq}

	enc := json.NewEncoder(w)
	_ = enc.Encode(ret)
}
