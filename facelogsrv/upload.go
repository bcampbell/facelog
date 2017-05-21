package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"time"
)

type Post struct {
	//GE2017   string `json:"ge2017,omitempty"`

	ID string `json:",omitempty"`

	Posted string   `json:"posted",omitempty"`
	Seen   string   `json:"seen",omitempty"`
	Reacts Reacts   `json:"reacts",omitempty"`
	Txt    string   `json:"txt",omitempty"`
	Desc   string   `json:"desc",omitempty"`
	Link   PostLink `json:"link",omitempty"`
	Page   string   `json:"page",omitempty"`
}

func (post *Post) AsRows() []string {

	return []string{
		post.ID,
		post.Seen,
		post.Posted,
		post.Desc,
		post.Txt,
		post.Link.URL,
		post.Link.Title,
		post.Link.Desc,
		strconv.Itoa(post.Reacts.Like),
		strconv.Itoa(post.Reacts.Love),
		strconv.Itoa(post.Reacts.Haha),
		strconv.Itoa(post.Reacts.Wow),
		strconv.Itoa(post.Reacts.Sad),
		strconv.Itoa(post.Reacts.Angry),
		post.Page,
	}
}

type PostLink struct {
	URL   string `json:"url",omitempty"`
	Title string `json:"title",omitempty"`
	Desc  string `json:"desc",omitempty"`
}

type Reacts struct {
	Angry int `json:"angry"`
	Haha  int `json:"haha"`
	Like  int `json:"like"`
	Love  int `json:"love"`
	Sad   int `json:"sad"`
	Wow   int `json:"wow"`
}

type DataDump struct {
	Uniq  string `json:"uniq"`
	Posts []Post `json:"posts"`
}

var uniqPat = regexp.MustCompile(`[0-9a-fA-F]{8,100}`)

func upHandler(w http.ResponseWriter, req *http.Request) {
	if req.Method != "POST" {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}

	var dat DataDump

	dec := json.NewDecoder(req.Body)
	err := dec.Decode(&dat)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	err = dumpDat(&dat)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERR: '%s': %s\n", dat.Uniq, err)
		http.Error(w, "server error", http.StatusInternalServerError)
	}
}

func dumpDat(dat *DataDump) error {
	// saneish uniq?
	uniq := dat.Uniq
	if !uniqPat.MatchString(uniq) {
		return fmt.Errorf("Bad Uniq")
	}

	userDir := filepath.Join(conf.dataDir, uniq)

	// is it a valid dest?
	inf, err := os.Stat(userDir)
	if err != nil {
		return err
	}
	if !inf.IsDir() {
		return fmt.Errorf("%s not dir", userDir)
	}

	// open/create file for appending
	now := time.Now().UTC()

	fileName := fmt.Sprintf("%s_%04d-%02d-%02d.csv", uniq, now.Year(), now.Month(), now.Day())
	outFile, err := os.OpenFile(filepath.Join(userDir, fileName), os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0666)
	if err != nil {
		return err
	}
	defer outFile.Close()

	// append the new csv data

	enc := csv.NewWriter(outFile)
	defer enc.Flush()
	for _, post := range dat.Posts {
		err = enc.Write(post.AsRows())
		if err != nil {
			return err
		}
	}

	fmt.Printf("'%s': uploaded %d posts\n", uniq, len(dat.Posts))
	return nil
}
