package uid

import (
	"testing"
)

func TestGenerateGameID(t *testing.T) {
	uid, err := GenerateGameID(12)
	if err != nil {
		t.Errorf("Should not return error, but got %v", err)
	}

	if len(uid) != 12 {
		t.Errorf("Should return 12 length, but got %v", uid)
	}
}
